document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('status');
    const openingNameElement = document.getElementById('openingName');
    let board = null; // Will be initialized later
    let game = new Chess(); // Assuming chess.js is correctly included
    const darkModeToggle = document.getElementById('darkModeToggle');

    let currentOpening = {};
    let currentMoveIndex = 0;

    //Actual Game
    // Define your openings
    const openings = [
        { "side": "White", "name": "Ruy Lopez", "defendsAgainst": "Open Games", "moves": ["e4", "e5", "Nf3", "Nc6", "Bb5"] },
        { "side": "White", "name": "Italian Game", "defendsAgainst": "Open Games", "moves": ["e4", "e5", "Nf3", "Nc6", "Bc4"] },
        { "side": "Black", "name": "Sicilian Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "c5", "Nf3", "d6", "d4"] },
        { "side": "Black", "name": "French Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "e6", "d4", "d5", "Nc3"] },
        { "side": "Black", "name": "Caro-Kann Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "c6", "d4", "d5", "Nc3"] },
        { "side": "Black", "name": "Pirc Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "d6", "d4", "Nf6", "Nc3", "g6"] },
        { "side": "Black", "name": "King's Indian Defense", "defendsAgainst": "Queen's Pawn Opening", "moves": ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"] },
        { "side": "White", "name": "Queen's Gambit", "defendsAgainst": "Closed Games", "moves": ["d4", "d5", "c4", "e6", "Nc3", "Nf6"] },
        { "side": "Black", "name": "Slav Defense", "defendsAgainst": "Queen's Gambit", "moves": ["d4", "d5", "c4", "c6"] },
        { "side": "White", "name": "King's Gambit", "defendsAgainst": "Open Games", "moves": ["e4", "e5", "f4", "exf4"] },
        { "side": "White", "name": "English Opening", "defendsAgainst": "Flank Openings", "moves": ["c4", "e5", "Nc3", "Nf6", "Nf3", "Nc6"] },
        { "side": "Black", "name": "Nimzo-Indian Defense", "defendsAgainst": "Queen's Pawn Opening", "moves": ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"] },
        { "side": "Black", "name": "Grünfeld Defense", "defendsAgainst": "Queen's Pawn Opening", "moves": ["d4", "Nf6", "c4", "g6", "Nc3", "d5"] },
        { "side": "Black", "name": "Alekhine's Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "Nf6", "e5", "Nd5", "d4", "d6"] },
        { "side": "Black", "name": "Dutch Defense", "defendsAgainst": "Queen's Pawn Opening", "moves": ["d4", "f5", "g3", "Nf6", "Bg2", "e6"] },
        { "side": "Black", "name": "Benoni Defense", "defendsAgainst": "Queen's Pawn Opening", "moves": ["d4", "Nf6", "c4", "c5", "d5", "e6"] },
        { "side": "Black", "name": "Modern Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "g6", "d4", "Bg7", "Nc3", "d6"] },
        { "side": "Black", "name": "Philidor Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "e5", "Nf3", "d6", "d4", "Nd7"] },
        { "side": "Black", "name": "Scandinavian Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"] },
        { "side": "White", "name": "Vienna Game", "defendsAgainst": "Open Games", "moves": ["e4", "e5", "Nc3", "Nf6", "f4", "d5"] },
        { "side": "Black", "name": "Petrov's Defense", "defendsAgainst": "King's Pawn Opening", "moves": ["e4", "e5", "Nf3", "Nf6", "Nxe5", "d6"] }
    ];
    function updateDarkMode() {
        const isDarkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
        document.body.classList.toggle('dark-mode', isDarkModeEnabled);
        darkModeToggle.textContent = isDarkModeEnabled ? 'Light Mode' : 'Dark Mode';
    }

    darkModeToggle.addEventListener('click', () => {
        const isDarkModeEnabled = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkModeEnabled ? 'disabled' : 'enabled');
        updateDarkMode();
    });

    updateDarkMode();

    const practiceAgainButton = document.getElementById('practiceAgain');
    const newOpeningButton = document.getElementById('newOpening');

    practiceAgainButton.addEventListener('click', restartOpening);
    newOpeningButton.addEventListener('click', startNewOpening);

    function restartOpening() {
        currentMoveIndex = 0; // Resets the index to start from the beginning of the opening
        
        resetToCurrentOpening(); // Resets the game to the start
        
        statusElement.textContent = "Try to complete the opening again!";
        practiceAgainButton.style.display = 'none';
        newOpeningButton.style.display = 'none';
      
        board.orientation(currentOpening.side === "Black" ? 'black' : 'white');
        
        // Adjusted to immediately update the board position after reset, before deciding on the next action
        board.position(game.fen());
        
        // If the opening is for Black, play White's first move automatically. Otherwise, set up for the player's move.
        if (currentOpening.side === "Black") {
            setTimeout(() => {
                // Ensure we're correctly starting the sequence from the beginning
                playNextMove();
            }, 100); // A slight delay to ensure the board updates visually for the user
        }
    }
    
    

    function startNewOpening() {
        selectRandomOpening();
        statusElement.textContent = "Try a new opening!";
        practiceAgainButton.style.display = 'none';
        newOpeningButton.style.display = 'none';
    }

    function selectRandomOpening() {
        const opening = openings[Math.floor(Math.random() * openings.length)];
        currentOpening = opening;
        game.reset();
        openingNameElement.textContent = `Opening: ${opening.name}`;
        currentMoveIndex = 0;
        statusElement.textContent = "Make your move";
    
        // Set the board orientation based on the opening's side
        if (opening.side === "Black") {
            board.orientation('black'); // Orient the board for playing as Black
            playNextMove(); // Computer plays the first move as White
        } else {
            board.orientation('white'); // Default orientation for playing as White
        }
    
        board.position(game.fen());
    }

    function initializeBoard() {
        const config = {
            draggable: true,
            position: 'start',
            onDrop: handleMove,
            onSnapEnd: () => {
                board.position(game.fen());
            },
        };
        board = Chessboard('board', config);
    }

    function handleMove(source, target) {
        let move = game.move({
            from: source,
            to: target,
            promotion: 'q' // Assume queen promotion for simplicity
        });
    
        if (move === null || move.san !== currentOpening.moves[currentMoveIndex]) {
            game.undo(); // Undo the move
            statusElement.textContent = `Incorrect move! The correct move was ${currentOpening.moves[currentMoveIndex]}. Try again.`;
            return 'snapback'; // Return the piece to its original position
        } else {
            currentMoveIndex++;
            updateStatusAfterMove();
    
            // Check if there's a next move in the sequence and it's the computer's turn to play
            if (currentMoveIndex < currentOpening.moves.length && ((currentOpening.side === "Black" && game.turn() === 'w') || (currentOpening.side === "White" && game.turn() === 'b'))) {
                playNextMove();
            }
        }
    }

    function playNextMove() {
        if (currentMoveIndex < currentOpening.moves.length) {
            setTimeout(() => {
                const move = game.move(currentOpening.moves[currentMoveIndex]);
                if (move) {
                    board.position(game.fen());
                    currentMoveIndex++;
                    updateStatusAfterMove();
                }
            }, 500); // Slight delay to visually separate automatic moves
        }
    }
    
    function updateStatusAfterMove() {
        if (currentMoveIndex >= currentOpening.moves.length) {
            statusElement.textContent = "Opening sequence completed.";
            practiceAgainButton.style.display = 'inline-block';
            newOpeningButton.style.display = 'inline-block';
        } else {
            statusElement.textContent = "Correct! Next move.";
        }
    }

    function resetToCurrentOpening() {
        game.reset(); // Resets the chess.js game state
        // Don't apply moves here since we're resetting to the start
        board.position('start'); // Set the board to the start position
    }

    initializeBoard();
    selectRandomOpening();
});