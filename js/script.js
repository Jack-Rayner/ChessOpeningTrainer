document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);

    const MOVE_DELAY = 400;
    const PIECE_THEME = 'img/chesspieces/nouveau/{piece}.svg';

    const FAMILY_NAMES = {
        ruylopez: 'Ruy Lopez',
        italiangame: 'Italian Game',
        kingsgambit: "King's Gambit",
        viennagame: 'Vienna Game',
        queensgambit: "Queen's Gambit",
        catalan: 'Catalan Opening',
        london: 'London System',
        englishopening: 'English Opening',
        sicilian: 'Sicilian Defense',
        french: 'French Defense',
        carokann: 'Caro-Kann Defense',
        pirc: 'Pirc Defense',
        modern: 'Modern Defense',
        alekhine: "Alekhine's Defense",
        scandinavian: 'Scandinavian Defense',
        petrov: "Petrov's Defense",
        philidor: 'Philidor Defense',
        kingsindian: "King's Indian Defense",
        nimzoindian: 'Nimzo-Indian Defense',
        queensindian: "Queen's Indian & Bogo-Indian",
        grunfeld: 'Grünfeld Defense',
        slav: 'Slav Defense',
        benoni: 'Benoni & Benko',
        dutch: 'Dutch Defense',
    };
    const familyName = key => FAMILY_NAMES[key] || key;
    const familyOrder = Object.keys(FAMILY_NAMES);

    const listJoin = items => items.length < 2 ? items.join('')
        : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

    // ---------- Opening data ----------

    let openingsData = {};
    let notesData = {};
    let plansData = {};
    let strategyData = {};
    // Notes and plans are optional: Learn mode works without them.
    const optionalJson = url => fetch(url)
        .then(response => (response.ok ? response.json() : {}))
        .catch(() => ({}));
    const notesReady = Promise.all(['notes', 'plans', 'strategy'].map(name => optionalJson(`./data/${name}.json`)))
        .then(([notes, plans, strategy]) => { notesData = notes; plansData = plans; strategyData = strategy; });
    const dataReady = fetch('./data/openings.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load openings');
            return response.json();
        })
        .then(async data => {
            openingsData = data;
            await notesReady;
            restoreSetup();
            renderPicker();
            showReady();
        })
        .catch(error => {
            console.error(error);
            setWho("The openings couldn't be loaded. Refresh the page to try again.");
        });

    // A family's "side" says whose opening it is (the Sicilian is Black's).
    // Either colour can drill any family: as White you face the Sicilian.
    function familiesFor(side) {
        const rank = key => (familyOrder.includes(key) ? familyOrder.indexOf(key) : familyOrder.length);
        return Object.keys(openingsData)
            .filter(key => openingsData[key][0].side === side)
            .sort((a, b) => rank(a) - rank(b));
    }

    // ---------- Book: every line merged into one tree, keyed by position ----------
    // Keying by position (not move order) means transpositions still count as book.

    const positionKey = fen => fen.split(' ').slice(0, 4).join(' ');
    const bookCache = new Map();

    // Returns Map(positionKey -> { moves: Set<san>, ends: [{family, name}] })
    function getBook(family) {
        const cacheKey = family || '*';
        if (bookCache.has(cacheKey)) return bookCache.get(cacheKey);

        const book = new Map();
        const node = key => {
            if (!book.has(key)) book.set(key, { moves: new Set(), ends: [] });
            return book.get(key);
        };
        for (const [fam, lines] of Object.entries(openingsData)) {
            if (family && fam !== family) continue;
            for (const line of lines) {
                const replay = new Chess();
                let legal = true;
                for (const san of line.moves) {
                    const from = node(positionKey(replay.fen()));
                    let move = null;
                    try { move = replay.move(san); } catch (e) { /* bad data */ }
                    if (!move) { legal = false; break; }
                    from.moves.add(move.san);
                }
                if (legal) node(positionKey(replay.fen())).ends.push({ family: fam, name: line.name });
                else console.warn(`Skipping illegal line: ${fam} / ${line.name}`);
            }
        }
        bookCache.set(cacheKey, book);
        return book;
    }

    // ---------- Learn mode: the family as a tree of positions ----------
    // node = { ply, moves: Map(san -> { child, from, to, count }), lines: Set(lineIndex) }

    const START_KEY = positionKey(new Chess().fen());
    const treeCache = new Map();

    function getTree(family) {
        if (treeCache.has(family)) return treeCache.get(family);
        const tree = new Map();
        const node = (key, ply) => {
            if (!tree.has(key)) tree.set(key, { ply, moves: new Map(), lines: new Set() });
            const n = tree.get(key);
            n.ply = Math.min(n.ply, ply);
            return n;
        };
        (openingsData[family] || []).forEach((line, index) => {
            const replay = new Chess();
            for (let i = 0; i < line.moves.length; i++) {
                const from = node(positionKey(replay.fen()), i);
                from.lines.add(index);
                let move = null;
                try { move = replay.move(line.moves[i]); } catch (e) { /* bad data */ }
                if (!move) return;
                const edge = from.moves.get(move.san) || { child: positionKey(replay.fen()), from: move.from, to: move.to, count: 0 };
                edge.count++;
                from.moves.set(move.san, edge);
            }
            node(positionKey(replay.fen()), line.moves.length).lines.add(index);
        });
        treeCache.set(family, tree);
        return tree;
    }

    // Notes are keyed by the moves that reach a position; they show once you arrive there,
    // by whichever move order.
    const noteCache = new Map();
    function getNotes(family) {
        if (noteCache.has(family)) return noteCache.get(family);
        const notes = new Map();
        for (const [moves, text] of Object.entries(notesData[family] || {})) {
            const replay = new Chess();
            try {
                moves.split(' ').forEach(san => replay.move(san));
                notes.set(positionKey(replay.fen()), text);
            } catch (e) { console.warn(`Skipping note with illegal moves: ${family} / ${moves}`); }
        }
        noteCache.set(family, notes);
        return notes;
    }

    // ---------- Learn mode: memory (spaced repetition per position) ----------
    // box 0 = new (shown with an arrow), 1 = seen (piece hinted), 2+ = from memory.
    // A correct answer moves a position up a box and pushes its next review out;
    // a miss drops it back to box 1 and makes it due straight away.

    const MEMORY_KEY = 'learn-v1';
    const MIN = 60e3, DAY = 864e5;
    const INTERVALS = [0, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 21 * DAY];
    const START_DEPTH = 6;     // plies unlocked to begin with
    const DEPTH_STEP = 4;      // plies added each time the unlocked part is mostly known
    const UNLOCK_SHARE = 0.8;  // share of unlocked positions that must be box 2+

    let memory = { cards: {}, depth: {} };
    try {
        const saved = JSON.parse(localStorage.getItem(MEMORY_KEY));
        if (saved && saved.cards) memory = { cards: saved.cards, depth: saved.depth || {} };
    } catch (e) { /* storage unavailable: progress lasts this visit only */ }
    const saveMemory = () => {
        try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); } catch (e) { /* ignore */ }
    };

    const studyKey = (family, color) => `${family}|${color}`;
    const cardKey = (family, color, key) => `${family}|${color}|${key}`;
    const cardFor = (family, color, key) => memory.cards[cardKey(family, color, key)];
    const boxOf = card => (card ? card.box : 0);
    const isDue = card => !card || card.due <= Date.now();
    const statusOf = card => (!card || card.box === 0 ? 'new' : card.box >= 3 ? 'learned' : 'learning');
    const depthFor = (family, color) => memory.depth[studyKey(family, color)] || START_DEPTH;
    const isTraineeNode = (n, color) => n && n.moves.size > 0 && (n.ply % 2 === 0) === (color === 'w');

    function grade(family, color, key, correct) {
        const ck = cardKey(family, color, key);
        const card = memory.cards[ck];
        if (correct) {
            const box = Math.min(boxOf(card) + 1, INTERVALS.length - 1);
            memory.cards[ck] = { box, due: Date.now() + INTERVALS[box] };
        } else {
            memory.cards[ck] = { box: 1, due: Date.now() };
        }
        saveMemory();
    }

    // Every position where it's the trainee's move, reachable within `depth` plies.
    function traineeKeys(tree, color, depth = Infinity) {
        const keys = new Set(), seen = new Set();
        const walk = key => {
            if (seen.has(key)) return;
            seen.add(key);
            const n = tree.get(key);
            if (!n || n.ply >= depth) return;
            if (isTraineeNode(n, color)) keys.add(key);
            n.moves.forEach(edge => walk(edge.child));
        };
        walk(START_KEY);
        return keys;
    }

    // How much practice waits down this branch (within the unlocked depth): new or due
    // positions count most, positions you've only just seen count a little.
    function branchNeed(tree, family, color, depth, key, seen = new Set()) {
        if (seen.has(key)) return 0;
        seen.add(key);
        const n = tree.get(key);
        if (!n || n.ply >= depth) return 0;
        let need = 0;
        if (isTraineeNode(n, color)) {
            const card = cardFor(family, color, key);
            need = isDue(card) ? 3 : card.box < 2 ? 1 : 0;
        }
        n.moves.forEach(edge => { need += branchNeed(tree, family, color, depth, edge.child, seen); });
        return need;
    }

    // Opens the next few moves once most of what's unlocked is known. Returns true if it did.
    function maybeUnlock(family, color) {
        const tree = getTree(family);
        const depth = depthFor(family, color);
        const keys = [...traineeKeys(tree, color, depth)];
        const deepest = Math.max(...[...tree.values()].map(n => n.ply));
        if (!keys.length || depth > deepest) return false;
        const known = keys.filter(k => boxOf(cardFor(family, color, k)) >= 2).length;
        if (known / keys.length < UNLOCK_SHARE) return false;
        memory.depth[studyKey(family, color)] = depth + DEPTH_STEP;
        saveMemory();
        return true;
    }

    // ---------- "Now playing" card ----------

    function setWho(text) { $('openingName').textContent = text; }

    function setFeedback(kind, text) {
        const el = $('feedback');
        el.hidden = !kind;
        el.className = `feedback${kind ? ` is-${kind}` : ''}`;
        $('feedbackText').textContent = text || '';
    }

    function setAlt(text) {
        $('altLine').hidden = !text;
        $('altLine').textContent = text || '';
    }

    function setReply(san) {
        const el = $('replyLine');
        el.hidden = !san;
        el.textContent = '';
        if (san) {
            el.append('Your opponent replied ');
            const b = document.createElement('b');
            b.textContent = san;
            el.append(b);
        }
    }

    function setResult(text) {
        const el = $('replyLine');
        el.hidden = !text;
        el.textContent = text || '';
    }

    // Idea notes: your move's note, then your opponent's reply's, each with the move in bold.
    function setNote(san, text) {
        const el = $('noteLine');
        el.textContent = '';
        el.hidden = true;
        if (text) addNote(san, text);
    }
    // The opening's idea and your side's plan, shown until your first move.
    function showPlan(family, side) {
        const plan = plansData[family];
        if (!plan) return;
        const el = $('noteLine');
        const row = document.createElement('span');
        row.className = 'note-row plan-row';
        const b = document.createElement('b');
        b.textContent = 'The plan';
        row.append(b, ` ${plan.idea} `);
        const yours = document.createElement('span');
        yours.className = 'plan-side';
        yours.textContent = `As ${side}: ${plan[side]}`;
        row.append(yours);
        el.append(row);
        el.hidden = false;
    }

    function addNote(san, text) {
        const el = $('noteLine');
        const row = document.createElement('span');
        row.className = 'note-row';
        const b = document.createElement('b');
        b.textContent = san;
        row.append(b, ` ${text}`);
        el.append(row);
        el.hidden = false;
    }

    function updateTurn() {
        const active = drill && !drill.finished;
        $('turn').hidden = !active;
        $('turnNote').hidden = !active;
        if (!active) return;
        const white = game.turn() === 'w';
        $('turnPiece').src = `img/chesspieces/nouveau/${white ? 'w' : 'b'}P.svg`;
        $('turnText').textContent = `${white ? 'White' : 'Black'} to move`;
        let note = 'Your opponent is thinking…';
        if (game.turn() === drill.userColor) {
            note = 'Your move';
            if (drill.mode === 'learn') {
                note = drill.hint === 'arrow' ? 'New position: play the arrowed move'
                    : drill.hint === 'piece' ? 'You have seen this one: the piece to move is marked'
                    : 'From memory';
            }
        }
        $('turnNote').textContent = note;
    }

    function showActions(which) {
        $('drillActions').hidden = which !== 'drill';
        $('endActions').hidden = which !== 'end';
        $('bookButton').textContent = drill && drill.mode === 'learn' ? 'Show me' : 'Show book moves';
        $('practiceAgain').textContent = drill && drill.mode === 'learn' ? 'Same branch again' : 'Retry this line';
        $('newOpening').textContent = drill && drill.mode === 'learn' ? 'Next run' : 'New drill';
    }

    function renderMoves() {
        renderMoveStrip();
        const list = $('moveList');
        const history = game.history();
        if (!history.length) {
            list.innerHTML = '<p class="moves-empty">No moves yet.</p>';
            return;
        }
        list.textContent = '';
        for (let i = 0; i < history.length; i += 2) {
            const n = document.createElement('span');
            n.className = 'n';
            n.textContent = `${i / 2 + 1}.`;
            list.append(n);
            for (const j of [i, i + 1]) {
                const cell = document.createElement('span');
                cell.textContent = history[j] || '';
                if (j === history.length - 1) cell.className = 'cur';
                list.append(cell);
            }
        }
    }

    // Phones: the game so far on one line under the board, scrolled to the latest move.
    function renderMoveStrip() {
        const strip = $('moveStrip');
        const history = game.history();
        strip.hidden = !history.length;
        strip.textContent = '';
        for (let i = 0; i < history.length; i += 2) {
            const li = document.createElement('li');
            const n = document.createElement('span');
            n.className = 'n';
            n.textContent = `${i / 2 + 1}.`;
            li.append(n);
            for (const j of [i, i + 1]) {
                if (!history[j]) continue;
                const move = document.createElement('span');
                move.textContent = `${history[j]} `;
                if (j === history.length - 1) move.className = 'cur';
                li.append(move);
            }
            strip.append(li);
        }
        strip.scrollLeft = strip.scrollWidth;
    }

    // ---------- Board ----------

    const game = new Chess();
    let book = null;
    let drill = null;
    // drill = { side, family, userColor, opponentChoices, replay, mistakes, missesHere, finished }
    let selected = null;

    const board = Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: PIECE_THEME,
        onDragStart: (source, piece) => {
            if (!drill || drill.finished) return false;
            if (game.turn() !== drill.userColor) return false;   // opponent is thinking
            if (piece[0] !== drill.userColor) return false;      // only your own pieces
            if (selected && selected !== source) clearSelection();
        },
        onDrop: (source, target) => {
            if (target === source) {            // a tap on your own piece selects it
                toggleSelection(source);
                return 'snapback';
            }
            clearSelection();
            return tryUserMove(source, target) ? undefined : 'snapback';
        },
        onSnapEnd: () => board.position(game.fen()),
    });

    const squareEl = sq => document.querySelector(`#board .square-${sq}`);

    function highlightLastMove() {
        document.querySelectorAll('#board .last-move').forEach(el => el.classList.remove('last-move'));
        const history = game.history({ verbose: true });
        const last = history[history.length - 1];
        if (!last) return;
        [last.from, last.to].forEach(sq => squareEl(sq)?.classList.add('last-move'));
    }

    // ---------- Learn hints: arrows and marked pieces ----------

    // The Learn arrow: a double brass rule, like the board's frame, closing into a slim
    // head, with a small bead on the starting square. Sizes scale with the square, with a
    // floor so the rules stay visible on a phone.
    let arrows = [];
    function drawArrows(list) {
        arrows = list;
        $('boardArrows')?.remove();
        if (!list.length) return;
        const host = $('board');
        const origin = host.getBoundingClientRect();
        const centre = sq => {
            const r = squareEl(sq)?.getBoundingClientRect();
            return r && { x: r.left - origin.left + r.width / 2, y: r.top - origin.top + r.height / 2, size: r.width };
        };
        const ns = 'http://www.w3.org/2000/svg';
        const el = (tag, attrs) => {
            const node = document.createElementNS(ns, tag);
            for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, typeof v === 'number' ? v.toFixed(1) : v);
            return node;
        };
        const svg = el('svg', { id: 'boardArrows', class: 'board-arrows', 'aria-hidden': 'true' });
        for (const { from, to } of list) {
            const a = centre(from), b = centre(to);
            if (!a || !b || !a.size) continue;   // board not laid out yet
            const len = Math.hypot(b.x - a.x, b.y - a.y);
            if (!len) continue;
            const size = a.size;
            const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len, nx = -uy, ny = ux;
            const rule = Math.max(1.5, size * 0.03), gap = Math.max(2.5, size * 0.06);
            const headLen = size * 0.34, headHalf = Math.max(6, size * 0.16);
            const start = { x: a.x + ux * size * 0.22, y: a.y + uy * size * 0.22 };
            const tip = { x: b.x - ux * size * 0.12, y: b.y - uy * size * 0.12 };
            const base = { x: tip.x - ux * headLen, y: tip.y - uy * headLen };
            const end = { x: base.x + ux * size * 0.08, y: base.y + uy * size * 0.08 };
            const g = el('g', { class: 'arrow' });
            for (const side of [1, -1]) {
                g.append(el('line', {
                    x1: start.x + nx * gap * side, y1: start.y + ny * gap * side,
                    x2: end.x + nx * gap * side, y2: end.y + ny * gap * side, 'stroke-width': rule,
                }));
            }
            const notch = { x: base.x + ux * size * 0.07, y: base.y + uy * size * 0.07 };
            g.append(el('path', { d: `M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}` +
                ` L${(base.x + nx * headHalf).toFixed(1)} ${(base.y + ny * headHalf).toFixed(1)}` +
                ` L${notch.x.toFixed(1)} ${notch.y.toFixed(1)}` +
                ` L${(base.x - nx * headHalf).toFixed(1)} ${(base.y - ny * headHalf).toFixed(1)} Z` }));
            g.append(el('circle', { cx: a.x + ux * size * 0.14, cy: a.y + uy * size * 0.14, r: Math.max(2.5, size * 0.05) }));
            svg.append(g);
        }
        host.append(svg);
    }

    function markPieces(squares) {
        document.querySelectorAll('#board .hint-from').forEach(el => el.classList.remove('hint-from'));
        squares.forEach(sq => squareEl(sq)?.classList.add('hint-from'));
    }

    function clearHints() {
        drawArrows([]);
        markPieces([]);
    }

    function clearSelection() {
        selected = null;
        document.querySelectorAll('#board .is-selected, #board .is-target').forEach(el =>
            el.classList.remove('is-selected', 'is-target', 'has-piece'));
    }

    function toggleSelection(square) {
        if (selected === square) { clearSelection(); return; }
        clearSelection();
        selected = square;
        squareEl(square)?.classList.add('is-selected');
        for (const move of game.moves({ square, verbose: true })) {
            const el = squareEl(move.to);
            if (!el) continue;
            el.classList.add('is-target');
            if (game.get(move.to)) el.classList.add('has-piece');
        }
    }

    // Tap-to-move: with a piece selected, tapping an empty or enemy square moves there.
    // (Taps on your own pieces go through chessboard.js as a zero-distance drag.)
    $('board').addEventListener('pointerup', event => {
        if (!selected || !drill || drill.finished) return;
        const squareDiv = event.target.closest('[data-square]');
        if (!squareDiv) return;
        const square = squareDiv.dataset.square;
        const piece = game.get(square);
        if (square === selected || (piece && piece.color === drill.userColor)) return;
        const from = selected;
        clearSelection();
        if (tryUserMove(from, square)) board.position(game.fen());
    });

    window.addEventListener('resize', () => {
        board.resize();
        clearSelection();
        highlightLastMove();
        drawArrows(arrows);
        if (drill && drill.hint === 'piece') showHint();
    });

    // ---------- Drill and Learn ----------
    // Drill: book replies at random, the line stays hidden, any book move is accepted.
    // Learn: one family, taught position by position. New positions are shown with an
    // arrow, then the piece is marked, then you play from memory; the opponent steers
    // towards the branches you're weakest on, and deeper moves unlock as you learn.

    const bookNode = () => book.get(positionKey(game.fen()));
    const treeNode = () => drill.tree.get(positionKey(game.fen()));
    const focusLine = () => (drill.focus === null ? null : openingsData[drill.family][drill.focus]);

    // True while the game so far follows the focused line exactly.
    function onFocusLine() {
        const line = focusLine();
        if (!line) return false;
        const history = game.history();
        return history.length <= line.moves.length && history.every((san, i) => san === line.moves[i]);
    }

    function startDrill({ mode = 'drill', side, family = null, replay = [], focus = null }) {
        if (mode === 'learn' && !family) family = familiesFor(side)[0];
        book = getBook(family);
        if (!book.size) {
            setWho('No lines found for that choice.');
            return;
        }
        selectMode(mode);
        selectSide(side);
        chooseOpening(family || '');
        closeSheet();
        document.body.classList.add('has-drill');
        $('setupSummaryText').textContent =
            `${mode === 'learn' ? 'Learn' : 'Drill'} · ${side} · ${family ? familyName(family) : 'Any opening'}`;
        $('setupSummary').hidden = false;
        setFolded($('setupCard'), true);
        $('mapSheetButton').hidden = mode !== 'learn';

        game.reset();
        clearSelection();
        clearHints();
        drill = {
            mode, side, family, replay, focus,
            tree: mode === 'learn' ? getTree(family) : null,
            userColor: side === 'White' ? 'w' : 'b',
            opponentChoices: [],
            mistakes: 0,
            missesHere: 0,
            hint: null,       // learn: 'arrow' | 'piece' | 'none' for the current position
            graded: false,    // learn: whether the current position has been scored yet
            run: { positions: 0, fromMemory: 0, fresh: 0, missed: 0 },
            finished: false,
        };

        board.orientation(side === 'White' ? 'white' : 'black');
        board.position('start', false);
        highlightLastMove();

        if (mode === 'learn') {
            const line = focusLine();
            setWho(`Learning ${familyName(family)} as ${side}${line ? ` · ${line.name}` : ''}`);
        } else {
            // The line name stays hidden until the end; only show what you chose.
            setWho(`You play ${side} · ${family ? familyName(family) : 'Any opening'}`);
        }
        setFeedback(null);
        setAlt(null);
        setReply(null);
        setNote(null);
        $('whereNext').hidden = true;
        if (mode === 'learn') showPlan(family, side);
        showActions('drill');
        renderMoves();
        renderMap();

        if (game.turn() === drill.userColor) prepareUserTurn();
        else {
            updateTurn();
            setTimeout(playOpponentMove, MOVE_DELAY);
        }
    }

    // Learn: the move to teach here, following the focused line when there is one,
    // otherwise the most common move in the family.
    function taughtSan(node) {
        const line = focusLine();
        const next = line && onFocusLine() ? line.moves[game.history().length] : null;
        if (next && node.moves.has(next)) return next;
        return [...node.moves.entries()].sort((a, b) => b[1].count - a[1].count)[0][0];
    }

    function showHint() {
        clearHints();
        if (!drill || drill.mode !== 'learn' || drill.finished) return;
        const node = treeNode();
        if (!node) return;
        if (drill.hint === 'arrow') drawArrows([node.moves.get(taughtSan(node))]);
        if (drill.hint === 'piece') markPieces([...new Set([...node.moves.values()].map(e => e.from))]);
    }

    function prepareUserTurn() {
        if (drill.mode === 'learn') {
            const box = boxOf(cardFor(drill.family, drill.userColor, positionKey(game.fen())));
            drill.hint = box === 0 ? 'arrow' : box === 1 ? 'piece' : 'none';
            drill.graded = false;
            showHint();
        }
        updateTurn();
    }

    function countMistakeHere() {
        if (drill.missesHere === 0) drill.mistakes++;
        drill.missesHere++;
    }

    // Learn: score the current position once, on the first attempt.
    function gradeHere(correct) {
        if (drill.graded) return;
        drill.graded = true;
        drill.run.positions++;
        if (!correct) drill.run.missed++;
        else if (drill.hint === 'arrow') drill.run.fresh++;
        else if (drill.hint === 'none') drill.run.fromMemory++;
        grade(drill.family, drill.userColor, positionKey(game.fen()), correct);
    }

    // Returns true when a note was shown.
    function showNoteFor(san) {
        if (drill.mode !== 'learn') return false;
        // While the plan card is up (you play Black), it stays the only note until your move.
        if ($('noteLine').querySelector('.plan-row')) return false;
        const text = getNotes(drill.family).get(positionKey(game.fen()));
        if (text) addNote(san, text);
        return Boolean(text);
    }

    // Returns true when the move was a book move and has been played.
    function tryUserMove(from, to) {
        if (!drill || drill.finished || game.turn() !== drill.userColor) return false;
        const node = bookNode();
        let move = null;
        try { move = game.move({ from, to, promotion: 'q' }); } catch (e) { /* illegal */ }
        if (!move) return false;

        if (!node.moves.has(move.san)) {
            game.undo();
            countMistakeHere();
            setFeedback('miss', `${move.san} isn't book here`);
            setReply(null);
            if (drill.mode === 'learn') {
                gradeHere(false);
                drill.hint = 'arrow';
                showHint();
                setAlt('Follow the arrow.');
                updateTurn();
                renderMap();
            } else {
                setAlt(drill.missesHere === 1 ? 'Try another move.' : `Book moves: ${listJoin([...node.moves])}.`);
            }
            return false;
        }

        if (drill.mode === 'learn') {
            game.undo();
            gradeHere(true);
            game.move(move.san);
            clearHints();
        }
        drill.missesHere = 0;
        const alternatives = [...node.moves].filter(san => san !== move.san);
        setFeedback('ok', `${move.san} was book`);
        setAlt(alternatives.length ? `Also book there: ${listJoin(alternatives)}` : null);
        setReply(null);
        setNote(null);
        showNoteFor(move.san);
        renderMap();
        afterMove();
        return true;
    }

    // Learn: pick the reply whose branch holds the most new or due positions, so each
    // run goes where you're weakest. With nothing waiting, follow the book's weighting.
    function targetedReply(node) {
        const depth = depthFor(drill.family, drill.userColor);
        const options = [...node.moves.entries()].map(([san, edge]) => ({
            san, count: edge.count,
            need: branchNeed(drill.tree, drill.family, drill.userColor, depth, edge.child),
        }));
        const needy = options.filter(o => o.need > 0);
        const pool = needy.length ? needy : options;
        const weight = o => (needy.length ? o.need : o.count);
        let r = Math.random() * pool.reduce((sum, o) => sum + weight(o), 0);
        for (const o of pool) { r -= weight(o); if (r <= 0) return o.san; }
        return pool[pool.length - 1].san;
    }

    function playOpponentMove() {
        if (!drill || drill.finished || game.turn() === drill.userColor) return;
        const choices = [...bookNode().moves];

        // "Retry this line" repeats the opponent's previous choices where it can.
        const repeat = drill.replay[drill.opponentChoices.length];
        let san;
        if (choices.includes(repeat)) san = repeat;
        else if (drill.mode === 'learn') {
            const line = focusLine();
            const next = line && onFocusLine() ? line.moves[game.history().length] : null;
            san = next && choices.includes(next) ? next : targetedReply(treeNode());
        } else san = choices[Math.floor(Math.random() * choices.length)];

        game.move(san);
        drill.opponentChoices.push(san);
        board.position(game.fen());
        setReply(san);
        // A note on the reply starts with the move in bold, so the reply line would repeat it.
        if (showNoteFor(san)) setReply(null);
        afterMove();
    }

    function afterMove() {
        renderMoves();
        highlightLastMove();
        const node = bookNode();
        if (!node || node.moves.size === 0) {
            finishDrill(node);
            return;
        }
        if (drill.mode === 'learn') {
            const line = focusLine();
            const tnode = treeNode();
            const following = onFocusLine();
            const beyond = tnode.ply >= depthFor(drill.family, drill.userColor);
            if ((following && game.history().length >= line.moves.length) || (beyond && !following)) {
                finishDrill(node);
                return;
            }
        }
        if (game.turn() === drill.userColor) prepareUserTurn();
        else {
            updateTurn();
            setTimeout(playOpponentMove, MOVE_DELAY);
        }
    }

    // The strategy for the line just played: the most specific variation whose moves the
    // line starts with, falling back to the family's plan card.
    function strategyFor(family, moves) {
        const entries = strategyData[family] || {};
        const line = moves.join(' ');
        let best = null;
        for (const key of Object.keys(entries)) {
            if ((line === key || line.startsWith(`${key} `)) && (!best || key.length > best.length)) best = key;
        }
        if (best) return entries[best];
        const plan = plansData[family];
        return plan && { aim: plan.idea, White: plan.White, Black: plan.Black };
    }

    function showWhereNext(family, moves) {
        const el = $('whereNext');
        const entry = family && strategyFor(family, moves);
        el.hidden = !entry;
        if (!entry) return;
        const you = drill.side, them = you === 'White' ? 'Black' : 'White';
        const esc = t => t.replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
        el.innerHTML = '<p class="wn-head">Where next</p>' +
            `<p class="wn-aim">${esc(entry.aim)}</p>` +
            `<p><b>You, ${you}:</b> ${esc(entry[you])}</p>` +
            `<p><b>Them, ${them}:</b> ${esc(entry[them])}</p>`;
    }

    function finishDrill(node) {
        drill.finished = true;
        drill.hint = null;
        clearSelection();
        clearHints();
        setNote(null);

        // Every line that reaches the final position ends there, so these name the line.
        const seen = new Set();
        const ends = (node ? node.ends : []).filter(end => {
            const key = `${end.family}|${end.name}`;
            return !seen.has(key) && seen.add(key);
        });

        if (drill.mode === 'learn') {
            const unlocked = maybeUnlock(drill.family, drill.userColor);
            const { positions, fromMemory, fresh, missed } = drill.run;
            setFeedback('end', 'Run complete');
            setAlt(ends.length ? ends[0].name : null);
            const parts = [`${positions} ${positions === 1 ? 'position' : 'positions'}`];
            if (fromMemory) parts.push(`${fromMemory} from memory`);
            if (fresh) parts.push(`${fresh} new`);
            if (missed) parts.push(`${missed} to review`);
            setResult(parts.join(' · ') + (unlocked ? '. The next moves are now unlocked.' : '.'));
            renderMap();
        } else {
            if (ends.length) {
                setFeedback('end', familyName(ends[0].family));
                const also = ends.slice(1, 3).map(e => e.name);
                setAlt(ends[0].name + (also.length ? ` (also: ${also.join('; ')})` : ''));
            } else {
                setFeedback('end', 'End of book');
                setAlt(null);
            }
            setWho(`You played ${drill.side} · ${drill.family ? familyName(drill.family) : 'Any opening'}`);
            setResult(drill.mistakes === 0
                ? 'Played from memory with no mistakes.'
                : `${drill.mistakes} ${drill.mistakes === 1 ? 'move' : 'moves'} needed another try.`);
        }
        // Use the named line's moves when the game reached its end, else the moves played.
        const end = ends.find(e => e.family === (drill.family || e.family));
        const named = end && openingsData[end.family].find(l => l.name === end.name);
        showWhereNext(end ? end.family : drill.family, named ? named.moves : game.history());
        updateTurn();
        showActions('end');
    }

    // ---------- Learn: the family map ----------
    // One row per line, one dot per move you make in it, coloured by how well you know it.

    function renderMap() {
        const card = $('mapCard');
        card.hidden = !drill || drill.mode !== 'learn';
        if (card.hidden) return;
        const { family, userColor: color, tree } = drill;
        const depth = depthFor(family, color);
        const unlocked = traineeKeys(tree, color, depth);
        const all = traineeKeys(tree, color);
        const counts = { learned: 0, learning: 0, new: 0 };
        let due = 0;
        unlocked.forEach(k => {
            const c = cardFor(family, color, k);
            counts[statusOf(c)]++;
            if (c && c.box > 0 && c.due <= Date.now()) due++;
        });
        const locked = all.size - unlocked.size;
        $('mapHeading').textContent = familyName(family);
        const plan = plansData[family];
        $('mapPlan').hidden = !plan;
        if (plan) {
            const esc = t => t.replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
            const you = drill.side, them = you === 'White' ? 'Black' : 'White';
            $('mapPlan').innerHTML = `<p class="plan-idea">${esc(plan.idea)}</p>` +
                `<p><b>You, ${you}:</b> ${esc(plan[you])}</p>` +
                `<p><b>Them, ${them}:</b> ${esc(plan[them])}</p>`;
        }
        $('mapSummary').textContent =
            `${counts.learned} known · ${counts.learning} learning · ${counts.new} new` +
            (locked ? ` · ${locked} locked` : '') + (due ? `. ${due} due for review.` : '.');

        const rows = openingsData[family].map((line, index) => {
            const replay = new Chess();
            const dots = [];
            for (let ply = 0; ply < line.moves.length; ply++) {
                const key = positionKey(replay.fen());
                if ((ply % 2 === 0) === (color === 'w')) {
                    const status = ply >= depth ? 'locked' : statusOf(cardFor(family, color, key));
                    dots.push(`<i class="dot is-${status}"></i>`);
                }
                try { replay.move(line.moves[ply]); } catch (e) { break; }
            }
            const current = drill.focus === index ? ' aria-current="true"' : '';
            const name = line.name.replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
            return `<button type="button" class="map-line" data-line="${index}"${current}>` +
                `<span class="map-name">${name}</span><span class="dots">${dots.join('')}</span></button>`;
        });
        $('mapLines').innerHTML = rows.join('');
    }

    $('mapLines').addEventListener('click', event => {
        const row = event.target.closest('.map-line');
        if (!row || !drill) return;
        startDrill({ mode: 'learn', side: drill.side, family: drill.family, focus: Number(row.dataset.line) });
    });

    $('restartButton').addEventListener('click', () => {
        if (drill) startDrill({ mode: drill.mode, side: drill.side, family: drill.family, focus: drill.focus });
    });
    $('bookButton').addEventListener('click', () => {
        if (!drill || drill.finished || game.turn() !== drill.userColor) return;
        countMistakeHere();
        if (drill.mode === 'learn') {
            gradeHere(false);
            drill.hint = 'arrow';
            showHint();
            updateTurn();
            renderMap();
        } else {
            setAlt(`Book moves here: ${listJoin([...bookNode().moves])}.`);
        }
    });
    $('practiceAgain').addEventListener('click', () => {
        if (drill) startDrill({ mode: drill.mode, side: drill.side, family: drill.family, replay: drill.opponentChoices, focus: drill.focus });
    });
    $('newOpening').addEventListener('click', () => {
        if (drill) startDrill({ mode: drill.mode, side: drill.side, family: drill.family });
    });

    // ---------- New drill: colour and opening ----------

    let selectedMode = 'drill';
    let selectedSide = 'White';
    let selectedFamily = '';
    const modeButtons = document.querySelectorAll('[data-mode]');
    const sideButtons = document.querySelectorAll('[data-side]');
    const selectWrap = $('selectWrap');
    const openingButton = $('openingButton');

    const MODE_HINTS = {
        drill: 'Book replies at random; the line stays hidden until the end.',
        learn: 'Learn one opening position by position, with the ideas behind the moves.',
    };

    // Your last choices are remembered, so the phone's Begin button starts straight away.
    function saveSetup() {
        try {
            localStorage.setItem('setup', JSON.stringify({ mode: selectedMode, side: selectedSide, family: selectedFamily }));
        } catch (e) { /* ignore */ }
    }
    function restoreSetup() {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem('setup')); } catch (e) { /* ignore */ }
        if (!saved) return;
        if (saved.side === 'White' || saved.side === 'Black') selectSide(saved.side);
        if (saved.mode === 'drill' || saved.mode === 'learn') selectMode(saved.mode);
        if (!saved.family || openingsData[saved.family]) chooseOpening(saved.family || '');
    }
    const setupSummary = () =>
        `${selectedMode === 'learn' ? 'Learn' : 'Drill'} · ${selectedSide} · ${selectedFamily ? familyName(selectedFamily) : 'Any opening'}`;
    function showReady() {
        saveSetup();
        if (drill) return;
        setWho(`Ready: ${setupSummary()}. Press Begin to start, or change the settings first.`);
    }

    function selectMode(mode) {
        selectedMode = mode;
        modeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
        $('modeHint').textContent = MODE_HINTS[mode];
        $('startButton').textContent = mode === 'learn' ? 'Begin learning' : 'Begin drill';
        renderPicker();
        showReady();
    }
    modeButtons.forEach(b => b.addEventListener('click', () => selectMode(b.dataset.mode)));

    function selectSide(side) {
        selectedSide = side;
        sideButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.side === side)));
        renderPicker();
        showReady();
    }
    sideButtons.forEach(b => b.addEventListener('click', () => selectSide(b.dataset.side)));

    function chooseOpening(value) {
        selectedFamily = value;
        $('openingValue').textContent = value ? familyName(value) : 'Any opening';
        document.querySelectorAll('#pickerOptions .picker-item').forEach(item =>
            item.setAttribute('aria-selected', String(item.dataset.value === value)));
    }

    function renderPicker() {
        if (!Object.keys(openingsData).length) return;
        const total = Object.values(openingsData).reduce((n, lines) => n + lines.length, 0);
        const own = familiesFor(selectedSide);
        const facing = familiesFor(selectedSide === 'White' ? 'Black' : 'White');
        const tick = '<svg class="tick" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 8.5 L6.5 12 L13 4.5"/></svg>';
        const item = (value, label, count) =>
            `<button type="button" class="picker-item" role="option" data-value="${value}" aria-selected="false">${tick}${label}<span class="count">${count}</span></button>`;

        // Learn mode teaches one family at a time, so "Any opening" isn't offered there.
        const learning = selectedMode === 'learn';
        if (learning && !selectedFamily) selectedFamily = own[0] || '';
        $('pickerOptions').innerHTML =
            (learning ? '' : item('', 'Any opening', `${total} lines`)) +
            `<p class="picker-group">${selectedSide === 'White' ? 'Your openings' : 'Your defenses'}</p>` +
            own.map(k => item(k, familyName(k), openingsData[k].length)).join('') +
            `<p class="picker-group">${selectedSide === 'White' ? "Against Black's defenses" : "Against White's openings"}</p>` +
            facing.map(k => item(k, familyName(k), openingsData[k].length)).join('');
        chooseOpening(selectedFamily);
    }

    const pickerItems = () => [...document.querySelectorAll('#pickerOptions .picker-item')];

    function openPicker() {
        selectWrap.classList.add('is-open');
        openingButton.setAttribute('aria-expanded', 'true');
        if (matchMedia('(max-width: 760px)').matches) document.body.style.overflow = 'hidden';
        const current = pickerItems().find(i => i.getAttribute('aria-selected') === 'true') || pickerItems()[0];
        current?.focus();
        current?.scrollIntoView({ block: 'nearest' });
    }

    function closePicker(returnFocus = true) {
        if (!selectWrap.classList.contains('is-open')) return;
        selectWrap.classList.remove('is-open');
        openingButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = openSheetName ? 'hidden' : '';
        if (returnFocus) openingButton.focus();
    }

    openingButton.addEventListener('click', async () => {
        await dataReady;
        if (selectWrap.classList.contains('is-open')) closePicker(); else openPicker();
    });
    $('pickerScrim').addEventListener('click', () => closePicker());
    $('pickerOptions').addEventListener('click', event => {
        const item = event.target.closest('.picker-item');
        if (!item) return;
        chooseOpening(item.dataset.value);
        showReady();
        closePicker();
    });
    $('picker').addEventListener('keydown', event => {
        const items = pickerItems();
        const i = items.indexOf(document.activeElement);
        if (event.key === 'Escape') { event.preventDefault(); closePicker(); }
        else if (event.key === 'ArrowDown') { event.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); items[Math.max(i - 1, 0)]?.focus(); }
        else if (event.key === 'Home') { event.preventDefault(); items[0]?.focus(); }
        else if (event.key === 'End') { event.preventDefault(); items[items.length - 1]?.focus(); }
    });
    document.addEventListener('click', event => {
        if (!selectWrap.contains(event.target)) closePicker(false);
    });

    async function beginFromSetup() {
        await dataReady;
        closePicker(false);
        startDrill({ mode: selectedMode, side: selectedSide, family: selectedFamily || null });
        $('beginLabel').textContent = 'Next';
    }
    $('startButton').addEventListener('click', beginFromSetup);
    $('beginButton').addEventListener('click', beginFromSetup);

    // ---------- Panels: folding cards (desktop) and bottom sheets (phones) ----------

    function setFolded(card, folded) {
        card.classList.toggle('is-collapsed', folded);
        card.querySelector('.card-toggle')?.setAttribute('aria-expanded', String(!folded));
    }

    // The map remembers whether you folded it.
    try { if (localStorage.getItem('fold-map') === '1') setFolded($('mapCard'), true); } catch (e) { /* ignore */ }

    document.querySelectorAll('.card-toggle').forEach(button => button.addEventListener('click', () => {
        const card = button.closest('.card');
        const folded = !card.classList.contains('is-collapsed');
        setFolded(card, folded);
        if (card.dataset.collapse) {
            try { localStorage.setItem(`fold-${card.dataset.collapse}`, folded ? '1' : '0'); } catch (e) { /* ignore */ }
        }
    }));
    $('setupSummary').addEventListener('click', () => setFolded($('setupCard'), false));

    let openSheetName = null;
    let sheetOpener = null;
    const sheetCard = name => document.querySelector(`.sheetable[data-sheet="${name}"]`);

    function openSheet(name) {
        closeSheet(false);
        const card = sheetCard(name);
        if (!card) return;
        openSheetName = name;
        sheetOpener = document.activeElement;
        card.classList.add('is-sheet-open');
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-modal', 'true');
        card.scrollTop = 0;
        $('sheetScrim').classList.add('is-open');
        document.body.style.overflow = 'hidden';
        card.querySelector('.sheet-close')?.focus();
    }

    function closeSheet(returnFocus = true) {
        if (!openSheetName) return;
        const card = sheetCard(openSheetName);
        card.classList.remove('is-sheet-open');
        card.removeAttribute('role');
        card.removeAttribute('aria-modal');
        $('sheetScrim').classList.remove('is-open');
        document.body.style.overflow = '';
        openSheetName = null;
        if (returnFocus) sheetOpener?.focus?.();
    }

    document.querySelectorAll('[data-open-sheet]').forEach(button =>
        button.addEventListener('click', () => openSheet(button.dataset.openSheet)));
    document.querySelectorAll('.sheet-close').forEach(button => button.addEventListener('click', () => closeSheet()));
    $('sheetScrim').addEventListener('click', () => closeSheet());
    document.addEventListener('keydown', event => {
        // The picker handles (and prevents) its own Escape first.
        if (event.key === 'Escape' && openSheetName && !event.defaultPrevented) closeSheet();
    });
    // Sheets only exist on phones; widening the window puts the cards back in the column.
    matchMedia('(max-width: 760px)').addEventListener('change', event => { if (!event.matches) closeSheet(false); });

    // ---------- Day / Night ----------
    // Follows the browser until you choose; the toggle then pins your choice.

    const themeToggle = $('themeToggle');
    const prefersDark = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => document.documentElement.dataset.theme
        ? document.documentElement.dataset.theme === 'dark'
        : prefersDark.matches;
    const syncThemeLabel = () => {
        themeToggle.textContent = isDark() ? 'Day' : 'Night';
        themeToggle.setAttribute('aria-label', isDark() ? 'Switch to day mode' : 'Switch to night mode');
    };
    syncThemeLabel();
    prefersDark.addEventListener('change', syncThemeLabel);
    themeToggle.addEventListener('click', () => {
        const next = isDark() ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
        syncThemeLabel();
    });

    // ---------- Portfolio embed: postMessage automation ----------

    window.addEventListener('message', async event => {
        const action = event.data && event.data.action;

        if (action === 'startOpening') {
            await dataReady;
            startDrill({ side: Math.random() < 0.5 ? 'White' : 'Black' });
        }

        // Plays a book move for the trainee (used by the demo autoplay); the opponent
        // then replies on its own as usual.
        if (action === 'makeMove' && drill && !drill.finished && game.turn() === drill.userColor) {
            const node = bookNode();
            if (!node || !node.moves.size) return;
            // Goes through the normal move check, so Learn mode scores it like a real move.
            const choices = [...node.moves];
            const san = choices[Math.floor(Math.random() * choices.length)];
            const move = new Chess(game.fen()).move(san);
            if (tryUserMove(move.from, move.to)) board.position(game.fen());
        }
    });
});
