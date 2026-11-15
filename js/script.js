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
    const dataReady = fetch('./data/openings.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load openings');
            return response.json();
        })
        .then(data => {
            openingsData = data;
            renderPicker();
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

    function updateTurn() {
        const active = drill && !drill.finished;
        $('turn').hidden = !active;
        $('turnNote').hidden = !active;
        if (!active) return;
        const white = game.turn() === 'w';
        $('turnPiece').src = `img/chesspieces/nouveau/${white ? 'w' : 'b'}P.svg`;
        $('turnText').textContent = `${white ? 'White' : 'Black'} to move`;
        $('turnNote').textContent = game.turn() === drill.userColor ? 'Your move' : 'Your opponent is thinking…';
    }

    function showActions(which) {
        $('drillActions').hidden = which !== 'drill';
        $('endActions').hidden = which !== 'end';
    }

    function renderMoves() {
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
    });

    // ---------- Drill ----------

    const bookNode = () => book.get(positionKey(game.fen()));

    function startDrill({ side, family = null, replay = [] }) {
        book = getBook(family);
        if (!book.size) {
            setWho('No lines found for that choice.');
            return;
        }
        selectSide(side);
        chooseOpening(family || '');

        game.reset();
        clearSelection();
        drill = {
            side, family, replay,
            userColor: side === 'White' ? 'w' : 'b',
            opponentChoices: [],
            mistakes: 0,
            missesHere: 0,
            finished: false,
        };

        board.orientation(side === 'White' ? 'white' : 'black');
        board.position('start', false);
        highlightLastMove();

        // The line name stays hidden until the end; only show what you chose.
        setWho(`You play ${side} · ${family ? familyName(family) : 'Any opening'}`);
        setFeedback(null);
        setAlt(null);
        setReply(null);
        showActions('drill');
        renderMoves();
        updateTurn();

        if (game.turn() !== drill.userColor) setTimeout(playOpponentMove, MOVE_DELAY);
    }

    function countMistakeHere() {
        if (drill.missesHere === 0) drill.mistakes++;
        drill.missesHere++;
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
            setAlt(drill.missesHere === 1 ? 'Try another move.' : `Book moves: ${listJoin([...node.moves])}.`);
            setReply(null);
            return false;
        }

        drill.missesHere = 0;
        const alternatives = [...node.moves].filter(san => san !== move.san);
        setFeedback('ok', `${move.san} was book`);
        setAlt(alternatives.length ? `Also book there: ${listJoin(alternatives)}` : null);
        setReply(null);
        afterMove();
        return true;
    }

    function playOpponentMove() {
        if (!drill || drill.finished || game.turn() === drill.userColor) return;
        const choices = [...bookNode().moves];

        // "Retry this line" repeats the opponent's previous choices where it can.
        const repeat = drill.replay[drill.opponentChoices.length];
        const san = choices.includes(repeat) ? repeat : choices[Math.floor(Math.random() * choices.length)];

        game.move(san);
        drill.opponentChoices.push(san);
        board.position(game.fen());
        setReply(san);
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
        updateTurn();
        if (game.turn() !== drill.userColor) setTimeout(playOpponentMove, MOVE_DELAY);
    }

    function finishDrill(node) {
        drill.finished = true;
        clearSelection();

        // Every line that reaches the final position ends there, so these name the line.
        const seen = new Set();
        const ends = (node ? node.ends : []).filter(end => {
            const key = `${end.family}|${end.name}`;
            return !seen.has(key) && seen.add(key);
        });

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
        updateTurn();
        showActions('end');
    }

    $('restartButton').addEventListener('click', () => {
        if (drill) startDrill({ side: drill.side, family: drill.family });
    });
    $('bookButton').addEventListener('click', () => {
        if (!drill || drill.finished || game.turn() !== drill.userColor) return;
        countMistakeHere();
        setAlt(`Book moves here: ${listJoin([...bookNode().moves])}.`);
    });
    $('practiceAgain').addEventListener('click', () => {
        if (drill) startDrill({ side: drill.side, family: drill.family, replay: drill.opponentChoices });
    });
    $('newOpening').addEventListener('click', () => {
        if (drill) startDrill({ side: drill.side, family: drill.family });
    });

    // ---------- New drill: colour and opening ----------

    let selectedSide = 'White';
    let selectedFamily = '';
    const sideButtons = document.querySelectorAll('[data-side]');
    const selectWrap = $('selectWrap');
    const openingButton = $('openingButton');

    function selectSide(side) {
        selectedSide = side;
        sideButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.side === side)));
        renderPicker();
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

        $('pickerOptions').innerHTML =
            item('', 'Any opening', `${total} lines`) +
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
        document.body.style.overflow = '';
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

    $('startButton').addEventListener('click', async () => {
        await dataReady;
        closePicker(false);
        startDrill({ side: selectedSide, family: selectedFamily || null });
    });

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
            const choices = [...node.moves];
            const san = choices[Math.floor(Math.random() * choices.length)];
            game.move(san);
            board.position(game.fen());
            setFeedback('ok', `${san} was book`);
            setAlt(null);
            setReply(null);
            afterMove();
        }
    });
});
