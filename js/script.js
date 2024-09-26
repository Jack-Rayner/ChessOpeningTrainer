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

    // Dark Mode Logic - Consolidated for Sun/Moon Toggle
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
        board.orientation(currentOpening.side === "Black" ? 'black' : 'white');
        board.position(game.fen());
        if (currentOpening.side === "Black") {
            setTimeout(playNextMove, moveDelay);
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
            onDrop: handleMove,
            onSnapEnd: () => board.position(game.fen()),
        });
    }

    initializeBoard();

    // Sidebar opening selections
    document.querySelectorAll('[data-opening]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            startNewOpening(button.dataset.opening);
        });
    });

    sidebarToggle.addEventListener('click', () => {
        const isOpen = sidebar.classList.contains('is-open');
        
        // Toggle 'open' state for sidebar
        sidebar.classList.toggle('is-open');
    
        // Toggle shift for container
        container.classList.toggle('is-shifted', !isOpen);
    
        // Toggle 'is-sidebar-open' on the body
        document.body.classList.toggle('is-sidebar-open', !isOpen);
    });
    
    // Close the sidebar when clicking outside
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('is-open');
            container.classList.remove('is-shifted');
            document.body.classList.remove('is-sidebar-open');
        }
    });
    document.querySelector('.tdnn').classList.toggle('day', isDarkModeEnabled);
});