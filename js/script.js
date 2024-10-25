document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('status');
    const openingNameElement = document.getElementById('openingName');

    let currentFamily = ''; 
    const practiceAgainButton = document.getElementById('practiceAgain');
    const newOpeningButton = document.getElementById('newOpening');
    
    practiceAgainButton.addEventListener('click', restartOpening);  
    newOpeningButton.addEventListener('click', () => {
        if (currentFamily) {
            startNewOpening(currentFamily);
        }
    });

    let board = null;
    let game = new Chess();
    let currentOpening = {};
    let currentMoveIndex = 0;
    const moveDelay = 300;

    // Fetch openings
    let openingsData = {};
    fetch('./data/openings.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load openings');
            return response.json();
        })
        .then(data => openingsData = data)
        .catch(error => {
            console.error(error);
            statusElement.textContent = "Error loading openings data.";
        });

    // Sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const container = document.getElementById('gameContainer');
    const sidebarToggle = document.getElementById('sidebarToggle');

    // Dark Mode Logic w/ sun and moon
    function initializeDarkMode() {
        const savedDarkMode = localStorage.getItem('darkMode');
        const isDarkModeEnabled = savedDarkMode === 'enabled';
        document.body.classList.toggle('dark-mode', isDarkModeEnabled);
        document.querySelector('.moon').classList.toggle('sun', isDarkModeEnabled);
    }

    function toggleDarkMode() {
        const isDarkModeEnabled = document.body.classList.toggle('dark-mode');
        document.querySelector('.moon').classList.toggle('sun', isDarkModeEnabled);  // Moon to sun toggle
        document.querySelector('.tdnn').classList.toggle('day', isDarkModeEnabled);  // Toggle background transition
        localStorage.setItem('darkMode', isDarkModeEnabled ? 'enabled' : 'disabled');
    }
    

    // Use the Sun/Moon button for Dark Mode Toggle
    document.querySelector('.tdnn').addEventListener('click', toggleDarkMode);

    initializeDarkMode();

    // Restart opening
    function restartOpening() {
        currentMoveIndex = 0;
        resetToCurrentOpening();
        statusElement.textContent = "Try to complete the opening again!";
        practiceAgainButton.style.display = 'none';
        newOpeningButton.style.display = 'none';
    
        // Re-enable dragging
        board = Chessboard('board', {
            draggable: true,  // Re-enable dragging for the new or restarted opening
            position: game.fen(),
            onDrop: handleMove,
            onSnapEnd: () => board.position(game.fen()),
    
            onDragStart: (source, piece, position, orientation) => {
                const isWhiteToMove = game.turn() === 'w';
                if ((isWhiteToMove && piece.search(/^b/) !== -1) || (!isWhiteToMove && piece.search(/^w/) !== -1)) {
                    return false;  // Prevent dragging opponent's pieces
                }
            }
        });
    
        board.orientation(currentOpening.side === "Black" ? 'black' : 'white');
        board.position(game.fen());
    
        if (currentOpening.side === "Black") {
            setTimeout(playNextMove, 100);
        }
    }

    // Start new opening
    function startNewOpening(openingFamily) {
        currentFamily = openingFamily;
        const familyKey = openingFamily.toLowerCase().replace(/\s+/g, '').replace(/['-]/g, '').replace(/ü/g, 'u');
        const familyData = openingsData[familyKey];
    
        if (familyData) {
            const randomVariation = familyData[Math.floor(Math.random() * familyData.length)];
            currentOpening = randomVariation;
            game.reset();
            currentMoveIndex = 0;
    
            openingNameElement.textContent = `Opening: ${openingFamily} - ${randomVariation.name}`;
            statusElement.textContent = "Make your move";
    
            // Re-enable dragging for new opening
            board = Chessboard('board', {
                draggable: true,
                position: game.fen(),
                onDrop: handleMove,
                onSnapEnd: () => board.position(game.fen()),
    
                onDragStart: (source, piece, position, orientation) => {
                    const isWhiteToMove = game.turn() === 'w';
                    if ((isWhiteToMove && piece.search(/^b/) !== -1) || (!isWhiteToMove && piece.search(/^w/) !== -1)) {
                        return false;  // Prevent dragging opponent's pieces
                    }
                }
            });
    
            board.orientation(randomVariation.side === "Black" ? 'black' : 'white');
            board.position(game.fen());
    
            practiceAgainButton.style.display = 'none';
            newOpeningButton.style.display = 'none';
    
            if (randomVariation.side === "Black") {
                setTimeout(playNextMove, 100);
            }
        } else {
            console.error(`Opening family not found: ${familyKey}`);
            statusElement.textContent = "Opening family not found.";
        }
    }

    // Handle piece moves
    function handleMove(source, target) {
        let move = game.move({ from: source, to: target, promotion: 'q' });
    
        if (move === null || move.san !== currentOpening.moves[currentMoveIndex]) {
            game.undo();
            statusElement.textContent = `Incorrect move! The correct move was ${currentOpening.moves[currentMoveIndex]}. Try again.`;
            return 'snapback';
        } else {
            currentMoveIndex++;
            updateStatusAfterMove();
    
            setTimeout(() => {
                board.position(game.fen());
                if (shouldPlayNextMove()) {
                    setTimeout(playNextMove, 10);
                }
            }, 100);
        }
    }

    // Play next move for the computer
    function playNextMove() {
        if (currentMoveIndex < currentOpening.moves.length) {
            setTimeout(() => {
                const move = game.move(currentOpening.moves[currentMoveIndex]);
                if (move) {
                    currentMoveIndex++;
                    board.position(game.fen());
                    updateStatusAfterMove();
                }
            }, moveDelay);
        }
    }

    function shouldPlayNextMove() {
        return currentMoveIndex < currentOpening.moves.length &&
            ((currentOpening.side === "Black" && game.turn() === 'w') || 
            (currentOpening.side === "White" && game.turn() === 'b'));
    }

    function updateStatusAfterMove() {
        if (currentMoveIndex >= currentOpening.moves.length) {
            statusElement.textContent = `Opening sequence completed: ${currentOpening.name}`;
            practiceAgainButton.style.display = 'inline-block';
            newOpeningButton.style.display = 'inline-block';
    
            // Get the current orientation (white or black)
            const currentOrientation = board.orientation();
    
            // Disable dragging of pieces after the opening is completed while keeping the current orientation
            board = Chessboard('board', {
                draggable: false, 
                position: game.fen(),  // keep current board position
                orientation: currentOrientation  // maintain current orientation
            });
        } else {
            statusElement.textContent = "Correct! Next move.";
        }
    }

    function resetToCurrentOpening() {
        game.reset();
        board.position('start');
    }

    // Initialize chessboard
    function initializeBoard() {
        board = Chessboard('board', {
            draggable: true,
            position: 'start',
            onDrop: (source, target) => {
                let move = game.move({ from: source, to: target, promotion: 'q' });
    
                // Snap back if move is invalid or doesn't match the opening sequence
                if (!move || move.san !== currentOpening.moves[currentMoveIndex]) {
                    game.undo();
                    statusElement.textContent = `Incorrect move! The correct move was ${currentOpening.moves[currentMoveIndex]}. Try again.`;
                    return 'snapback';
                }
    
                // Move is valid and part of sequence
                currentMoveIndex++;
                updateStatusAfterMove();
                board.position(game.fen());  // Update the board with the new position
            },
            onSnapEnd: () => board.position(game.fen()),
    
            // Prevent dragging pieces of the opposite color
            onDragStart: (source, piece, position, orientation) => {
                // Get the current player's side based on the opening side
                const isWhiteToMove = game.turn() === 'w';
    
                // Block dragging if the piece does not belong to the current player
                if ((isWhiteToMove && piece.search(/^b/) !== -1) || (!isWhiteToMove && piece.search(/^w/) !== -1)) {
                    return false; // Prevent dragging
                }
            }
        });
    
        // start opening if user hovers over board
        setTimeout(() => {
            const boardContainer = document.getElementById('board');
            if (boardContainer) {
                boardContainer.addEventListener('mouseenter', () => {
    
                    if (!currentOpening.name) {
                        setTimeout(() => {
                            const randomFamily = Object.keys(openingsData)[Math.floor(Math.random() * Object.keys(openingsData).length)];
                            startNewOpening(randomFamily);
                        }, 100);
                    }
                });
            } else {
                console.error('Board container not found');
            }
        }, 10);
    }    
    

    initializeBoard();

    // Sidebar opening selections
    document.querySelectorAll('[data-opening]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            startNewOpening(button.dataset.opening);
        });
    });

    // Sidebar hover functionality to open
    sidebarToggle.addEventListener('mouseenter', () => {
        sidebar.classList.add('is-open');
        document.body.classList.add('is-sidebar-open');
    });

    // Sidebar hover functionality to close
    sidebar.addEventListener('mouseleave', () => {
        sidebar.classList.remove('is-open');
        document.body.classList.remove('is-sidebar-open');
    });
    document.querySelector('.tdnn').classList.toggle('day', isDarkModeEnabled);
});