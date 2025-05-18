// Clase que representa la serpiente y maneja su comportamiento
class Snake {
    // Inicializa la serpiente con una posición inicial y dirección
    constructor() {
        // Array de segmentos que forman el cuerpo de la serpiente
        this.segments = [{x: 10, y: 10}];
        // Dirección actual de movimiento
        this.direction = 'right';
        // Próxima dirección a tomar (evita giros de 180 grados)
        this.nextDirection = 'right';
    }

    // Mueve la serpiente en la dirección actual y maneja la colisión con la comida
    move(food) {
        // Crea una copia de la cabeza actual
        const head = {...this.segments[0]};

        // Actualiza la posición de la cabeza según la dirección
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Añade la nueva cabeza al inicio del array
        this.segments.unshift(head);
        
        // Verifica si la serpiente comió la comida
        if (head.x === food.x && head.y === food.y) {
            return true; // La serpiente crece
        }
        
        // Si no comió, elimina el último segmento
        this.segments.pop();
        return false;
    }

    // Cambia la dirección de la serpiente evitando giros de 180 grados
    changeDirection(newDirection) {
        // Define las direcciones opuestas para prevenir giros inválidos
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        // Solo cambia la dirección si no es opuesta a la actual
        if (opposites[this.direction] !== newDirection) {
            this.nextDirection = newDirection;
        }
    }

    // Actualiza la dirección actual de la serpiente
    update() {
        // Aplica la nueva dirección almacenada
        this.direction = this.nextDirection;
    }

    checkCollision(gridSize) {
        const head = this.segments[0];
        
        // Colisión con el muro
        if (head.x < 0 || head.x >= gridSize || 
            head.y < 0 || head.y >= gridSize) {
            return true;
        }

        // Colisión con el cuerpo de la serpiente
        for (let i = 1; i < this.segments.length; i++) {
            if (head.x === this.segments[i].x && 
                head.y === this.segments[i].y) {
                return true;
            }
        }

        return false;
    }
}

// Clase principal que maneja la lógica del juego
class Game {
    // Inicializa el juego y configura el canvas
    constructor() {
        // Obtiene el elemento canvas y su contexto
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        // Configura el tamaño de la cuadrícula
        this.gridSize = 20;
        this.tileSize = 400 / this.gridSize; // Ajustado para un área de juego de 400x400
        // Inicializa el sistema de puntuación
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0;
        // Configuración de velocidad del juego
        this.speedOptions = {
            slow: 150,  // Lento
            normal: 100, // Normal
            fast: 50    // Rápido
        };
        // Obtener la velocidad guardada o usar la normal por defecto
        this.selectedSpeed = localStorage.getItem('snakeSpeed') || 'normal';
        this.gameSpeed = this.speedOptions[this.selectedSpeed];
        
        // Configuración de tamaño de cuadrícula
        this.gridSizeOptions = {
            small: 20,   // Pequeño
            medium: 30,  // Mediano
            large: 40    // Grande
        };
        // Obtener el tamaño guardado o usar el pequeño por defecto
        this.selectedGridSize = localStorage.getItem('snakeGridSize') || 'small';
        this.gridSize = this.gridSizeOptions[this.selectedGridSize];
        this.tileSize = 400 / this.gridSize;
        
        this.gameStarted = false;
        this.isGameOver = false; // Estado para controlar si el juego ha terminado
        // Propiedades para el botón de reinicio
        this.retryButton = {
            x: 0,
            y: 0,
            width: 200,
            height: 56,
            visible: false
        };

        // Inicializa el juego
        this.initGame();
        
        // Configura el evento de teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        // Configura el evento de clic para el botón de reinicio
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        // Configura el evento de movimiento del mouse
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Configurar los botones de velocidad y tamaño
        this.setupSpeedButtons();
        this.setupGridSizeButtons();
    }

    // Genera una nueva posición aleatoria para la comida
    generateFood() {
        // Crea una nueva posición aleatoria dentro de la cuadrícula
        const food = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };

        // Asegurarse de que la comida no esté en la serpiente
        const isOnSnake = this.snake.segments.some(
            segment => segment.x === food.x && segment.y === food.y
        );

        if (isOnSnake) return this.generateFood();
        return food;
    }

    // Maneja los eventos de teclado para controlar la serpiente
    handleKeyPress(event) {
        if (this.isGameOver) {
            // Ya no reiniciamos con cualquier tecla, solo con el botón
            return; 
        }

        // Mapea las teclas de flecha a direcciones
        const keyActions = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        // Obtiene la nueva dirección basada en la tecla presionada
        const newDirection = keyActions[event.key];
        if (newDirection) {
            event.preventDefault(); // Evita el desplazamiento de la página
            if (!this.gameStarted) {
                this.startGame(); // Inicia el juego si no ha comenzado
            }
            this.snake.changeDirection(newDirection);
        }
    }

    update() {
        this.snake.update();
        
        if (this.snake.move(this.food)) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
        }

        if (this.snake.checkCollision(this.gridSize)) {
            this.endGame();
        }
    }

    // Dibuja el estado actual del juego en el canvas
    draw() {
        // Limpia el canvas con color de fondo
        this.ctx.fillStyle = '#181825';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibuja la cuadrícula
        this.ctx.strokeStyle = '#222738';
        this.ctx.lineWidth = 1;

        // Líneas verticales
        for (let x = 0; x <= this.canvas.width; x += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y <= this.canvas.height; y += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Dibuja la serpiente
        this.snake.segments.forEach((segment, index) => {
            const x = segment.x * this.tileSize;
            const y = segment.y * this.tileSize;
            const size = this.tileSize - 1;

            // Solo aplica el efecto neón a la cabeza
            if (index === 0) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#00FFA2';
                this.ctx.fillStyle = '#00FFA2';
            } else {
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#FFFFFF';
            }
            
            // Dibuja el segmento
            this.ctx.fillRect(x, y, size, size);
        });

        // Dibuja la comida con efecto neón rojo
        const foodX = this.food.x * this.tileSize;
        const foodY = this.food.y * this.tileSize;
        const foodSize = this.tileSize - 1;

        // Configura el efecto de sombra para la comida
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.fillStyle = '#FFFFFF';
        
        // Dibuja la comida con sombra
        this.ctx.fillRect(foodX, foodY, foodSize, foodSize);
        
        // Resetea la sombra
        this.ctx.shadowBlur = 0;

        // Dibuja el mensaje de Game Over si el juego ha terminado
        if (this.isGameOver) {
            this.ctx.fillStyle = '#181825';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.font = '24px Space Grotesk';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.font = '16px Space Grotesk';
            this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
            this.ctx.fillText(`HIGH SCORE: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            // Dibuja el botón de reinicio
            if (this.retryButton.visible) {
                // Dibuja el fondo del botón con bordes redondeados
                this.ctx.fillStyle = '#6E7888';
                this.ctx.shadowBlur = 0;
                this.ctx.shadowColor = '#6E7888';
                
                // Dibuja un rectángulo con bordes redondeados (10px de radio)
                this.roundRect(this.retryButton.x, this.retryButton.y, this.retryButton.width, this.retryButton.height, 24);
                
                // Dibuja el texto del botón
                this.ctx.shadowBlur = 0;
                this.ctx.font = '18px Space Grotesk';
                this.ctx.fillStyle = 'white';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Jugar otra vez', this.retryButton.x + this.retryButton.width / 2, this.retryButton.y + this.retryButton.height / 2 + 6);
            }
        }
    }

    // Inicializa el estado del juego
    initGame() {
        try {
            console.log("Inicializando juego...");
            this.snake = new Snake();
            this.food = this.generateFood();
            this.score = 0;
            document.getElementById('score').textContent = this.score;
            this.highScore = localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0;
            this.isGameOver = false;
            this.gameStarted = false;
            this.retryButton.visible = false;
            
            // Actualizar la UI para los selectores
            this.updateSpeedUI();
            this.updateGridSizeUI();
            
            this.draw(); // Dibuja el estado inicial
            console.log("Juego inicializado correctamente");
        } catch (error) {
            console.error("Error al inicializar el juego:", error);
        }
    }

    // Inicia el juego
    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        
        // Inicia el bucle principal del juego
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.gameSpeed);
    }

    // Finaliza el juego y muestra la puntuación final
    endGame() {
        // Detiene el bucle del juego
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.gameStarted = false;
        this.isGameOver = true; // Establece el estado de fin de juego

        // Actualiza la puntuación máxima si es necesario
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            // Actualiza la visualización de la puntuación máxima si existe
            const highScoreDisplay = document.getElementById('highScoreDisplay');
            if (highScoreDisplay) {
                highScoreDisplay.textContent = this.highScore;
            }
        }

        // Configura y muestra el botón de reinicio
        this.retryButton.x = this.canvas.width / 2 - this.retryButton.width / 2;
        this.retryButton.y = this.canvas.height / 2 + 40;
        this.retryButton.visible = true;

        this.draw(); // Dibuja la pantalla de Game Over con el botón
    }
    
    // Método para dibujar rectángulos con bordes redondeados
    roundRect(x, y, width, height, radius) {
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        
        // Dibujar el rectángulo con bordes redondeados
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // Maneja los eventos de clic para el botón de reinicio
    handleClick(event) {
        // Solo procesa clics si el juego ha terminado y el botón es visible
        if (this.isGameOver && this.retryButton.visible) {
            // Obtiene la posición del clic relativa al canvas
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            
            // Verifica si el clic fue dentro del botón
            if (clickX >= this.retryButton.x && 
                clickX <= this.retryButton.x + this.retryButton.width && 
                clickY >= this.retryButton.y && 
                clickY <= this.retryButton.y + this.retryButton.height) {
                // Reinicia el juego
                this.initGame();
                // Restaura el cursor a su estado normal
                this.canvas.style.cursor = 'default';
            }
        }
    }
    
    // Maneja los eventos de movimiento del mouse para el botón de reinicio
    handleMouseMove(event) {
        if (this.isGameOver && this.retryButton.visible) {
            // Obtiene la posición del mouse relativa al canvas
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            // Verifica si el mouse está sobre el botón
            if (mouseX >= this.retryButton.x && 
                mouseX <= this.retryButton.x + this.retryButton.width && 
                mouseY >= this.retryButton.y && 
                mouseY <= this.retryButton.y + this.retryButton.height) {
                // Cambia el cursor a pointer cuando está sobre el botón
                this.canvas.style.cursor = 'pointer';
            } else {
                // Restaura el cursor a su estado normal
                this.canvas.style.cursor = 'default';
            }
        }
    }
    
    // Configura los botones de velocidad
    setupSpeedButtons() {
        const speedSelect = document.getElementById('speed-select');
        if (speedSelect) {
            // Establece el valor seleccionado basado en la configuración actual
            speedSelect.value = this.selectedSpeed;
            
            // Configura el evento de cambio
            speedSelect.addEventListener('change', () => {
                this.selectedSpeed = speedSelect.value;
                this.gameSpeed = this.speedOptions[this.selectedSpeed];
                localStorage.setItem('snakeSpeed', this.selectedSpeed);
                
                // Si el juego está en curso, reinicia el bucle con la nueva velocidad
                if (this.gameStarted) {
                    clearInterval(this.gameLoop);
                    this.gameLoop = setInterval(() => {
                        this.update();
                        this.draw();
                    }, this.gameSpeed);
                }
            });
        }
    }
    
    // Configura los botones de tamaño de cuadrícula
    setupGridSizeButtons() {
        const gridSelect = document.getElementById('grid-select');
        if (gridSelect) {
            // Establece el valor seleccionado basado en la configuración actual
            gridSelect.value = this.selectedGridSize;
            
            // Configura el evento de cambio
            gridSelect.addEventListener('change', () => {
                this.selectedGridSize = gridSelect.value;
                this.gridSize = this.gridSizeOptions[this.selectedGridSize];
                this.tileSize = 400 / this.gridSize;
                localStorage.setItem('snakeGridSize', this.selectedGridSize);
                
                // Reinicia el juego con el nuevo tamaño de cuadrícula
                this.initGame();
            });
        }
    }
    
    // Actualiza la UI para mostrar la velocidad seleccionada
    updateSpeedUI() {
        const speedSelect = document.getElementById('speed-select');
        if (speedSelect) {
            speedSelect.value = this.selectedSpeed;
        }
    }
    
    // Actualiza la UI para mostrar el tamaño de cuadrícula seleccionado
    updateGridSizeUI() {
        const gridSelect = document.getElementById('grid-select');
        if (gridSelect) {
            gridSelect.value = this.selectedGridSize;
        }
    }
}

// Inicializa el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});