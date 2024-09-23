document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('status');
    const openingNameElement = document.getElementById('openingName');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    let currentFamily = ''; // Store users current selected opening family
    const practiceAgainButton = document.getElementById('practiceAgain');
    const newOpeningButton = document.getElementById('newOpening');
    
    practiceAgainButton.addEventListener('click', restartOpening);  
    newOpeningButton.addEventListener('click', () => {
        if (currentFamily) {
            startNewOpening(currentFamily); // Pass the current family to startNewOpening
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
        statusElement.textContent = "Failed to load openings. Please try again later.";
    });

    // Dark Mode
    function initializeDarkMode() {
        const isDarkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
        document.body.classList.toggle('dark-mode', isDarkModeEnabled);
    }
   
    darkModeToggle.addEventListener('click', () => {
        const isDarkModeEnabled = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', isDarkModeEnabled);
        localStorage.setItem('darkMode', isDarkModeEnabled ? 'enabled' : 'disabled');
    });
   
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
        currentFamily = openingFamily;  // Remember the selected family
        const familyKey = openingFamily.toLowerCase()
            .replace(/\s+/g, '')    
            .replace(/['-]/g, '')   
            .replace(/ü/g, 'u');
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
                setTimeout(() => {
                    playNextMove(); 
                }, 100);
            }
        } else {
            statusElement.textContent = "Opening family not found.";
        }
    }

    // Handle piece moves
    function handleMove(source, target) {
        let move = game.move({ from: source, to: target, promotion: 'q' });
    
        // Validate the move against the current opening variation
        if (move === null || move.san !== currentOpening.moves[currentMoveIndex]) {
            game.undo(); 
            statusElement.textContent = `Incorrect move! The correct move was ${currentOpening.moves[currentMoveIndex]}. Try again.`;
            return 'snapback';  // Snap back if the move is incorrect
        } else {
            currentMoveIndex++;  // Move to the next one in the variation
            updateStatusAfterMove();
    
            // Delay board update slightly after the move to avoid animation conflicts
            setTimeout(() => {
                board.position(game.fen());  // Update board position after the user's move
                if (shouldPlayNextMove()) {
                    setTimeout(playNextMove, 10);  // Delay the computer's next move slightly
                }
            }, 10);  // Short delay for smooth animation
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

    // Sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const container = document.getElementById('gameContainer');
    const sidebarToggle = document.getElementById('sidebarToggle');

    function toggleSidebar() {
        const isOpen = sidebar.style.left === '0px';
        sidebar.style.left = isOpen ? '-250px' : '0px';
        container.classList.toggle('shifted', !isOpen);
        sidebarToggle.classList.toggle('active', !isOpen);
    }   
    
    sidebarToggle.addEventListener('click', toggleSidebar);
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.style.left = '-250px';
        }
    });

    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.style.left = '-250px'; // Close sidebar
    
            // Update the text color based on the current mode
            if (document.body.classList.contains('dark-mode')) {
                sidebarToggle.style.color = getComputedStyle(document.documentElement).getPropertyValue('--dark-mode-text');
            } else {
                sidebarToggle.style.color = getComputedStyle(document.documentElement).getPropertyValue('--light-mode-text');
            }
        }
    });

    sidebar.style.left = '-250px'; // Ensure the sidebar starts closed
});