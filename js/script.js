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
    fetch('/data/openings.json')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to load openings'))
        .then(data => openingsData = data)
        .catch(error => {
            console.error(error);
            statusElement.textContent = "Error loading openings data.";
        });

    // Dark Mode
    function initializeDarkMode() {
        const savedDarkMode = localStorage.getItem('darkMode');
        document.body.classList.toggle('dark-mode', savedDarkMode === 'enabled');
        updateSidebarToggleColor();
    }

    function toggleDarkMode() {
        const isDarkModeEnabled = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', isDarkModeEnabled);
        localStorage.setItem('darkMode', isDarkModeEnabled ? 'enabled' : 'disabled');
        updateSidebarToggleColor();
    }

    function updateSidebarToggleColor() {
        const mode = document.body.classList.contains('dark-mode') ? '--dark-mode-text' : '--light-mode-text';
        sidebarToggle.style.color = getComputedStyle(document.documentElement).getPropertyValue(mode);
    }

    darkModeToggle.addEventListener('click', toggleDarkMode);
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

    sidebarToggle.addEventListener('click', () => {
        sidebar.style.left = sidebar.style.left === '0px' ? '-250px' : '0px';
        container.classList.toggle('shifted');
        sidebarToggle.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.style.left = '-250px'; 
            updateSidebarToggleColor(); // Update the text color when closing the sidebar
        }
    });

    sidebar.style.left = '-250px';
});