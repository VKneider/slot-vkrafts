const Option = class extends HTMLElement {
    constructor(name, percentage, unlockEveryThisTurns) {
        super();
        this.name = name;
        this.percentage = percentage;
        this.unlockEveryThisTurns = unlockEveryThisTurns || null;
        this.uniqueOptionId = Math.random().toString(36).substr(2, 9);
        this.locked = false;
        this.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }
};

customElements.define('my-option', Option);

const Options = class  {


    constructor(options, automaticPercentageAssignment) {
        this.options = [];
        this.automaticPercentageAssignment=automaticPercentageAssignment

        options.forEach(option => {
            this.addOption(option);
        });

        this.futureLockedOptions = {}
        this.currentTurn = 1;      
        
        this.selectedOptionsHistory = [];
    }

    addOption(option) {
        this.options.push(option);

        if(option.unlockEveryThisTurns !== null){
            option.locked = true;
        }

        if(this.automaticPercentageAssignment){
            this.automaticallyAssignPercentages();
        }


    }

    deleteOption(optionToDelete) {
        this.options = this.options.filter(option => optionToDelete.uniqueOptionId !== option.uniqueOptionId);
    }

    automaticallyAssignPercentages() {
        
        const total = this.options.length;
        if (total > 0) {
            const newPercentage = 100 / total; // Dividir el 100% entre el número total de opciones
            this.options.forEach((option, index) => {
                option.percentage = newPercentage;
            });
            }
    }

    



    reset(){
        this.options = [];
        this.currentTurn = 1;
        this.selectedOptionsHistory = [];
    }
    
    
   
    checkLockForOptions(){
        this.options.forEach(option => {

            if(option.unlockEveryThisTurns === null){
                option.locked = false;
                return;
            }

            if(this.currentTurn % option.unlockEveryThisTurns === 0 ){
                option.locked = false;
                //console.log(`${option.name} is unlocked`); 
            } 
        });
    }


    //Create a method that will choose a random option from the options array excluding the ones that are locked
    getOptionRandomly(){
        this.checkLockForOptions();
        const unlockedOptions = this.options.filter(option => option.locked === false);        
        
        const selectedOption = unlockedOptions[Math.floor(Math.random() * unlockedOptions.length)];
        if(selectedOption.unlockEveryThisTurns !== null){
            selectedOption.locked = true;
        }
        
        if(selectedOption.name === '1 Franela'){
            console.log(`Actual Turn: ${this.currentTurn} - Price: ${selectedOption.name}`);
        }

        this.selectedOptionsHistory.push(selectedOption);
        this.currentTurn++;
        return selectedOption;
    }

    getSelectedOptionsHistoryData(){
        const selectedOptionTimes = {}
        this.selectedOptionsHistory.forEach(option => {
            if(selectedOptionTimes[option.name]){
                selectedOptionTimes[option.name]++;
            } else {
                selectedOptionTimes[option.name] = 1;
            }
        });

        return selectedOptionTimes;
    }

    addMultipleOptions(options){
        options.forEach(option => {
            this.addOption(option);
        });
    }

}

const optionsObjectArray =
    [
        new Option('Intentalo de nuevo', 10, null), 
        new Option('Foto con VKrafts', 20,null ), 
        new Option('1 Abrazo', 30, null),
        new Option('1 Sticker Impreso', 10, null), 
        new Option('1 Sticker Impreso', 20, null), 
        new Option('1 Sticker en vinil', 10, null), 
        new Option('1 Franela', 20, 10), 
        new Option('Extra 8', 10, null), 
        new Option('Extra 9', 10, null), 
        new Option('Extra 10', 10, null), 
    ]


const slotContainer = document.querySelector('.slot-container');

optionsObjectArray.forEach(option => {
    const slot = document.createElement('div');
    slot.classList.add('slot');
   // slot.style.backgroundColor = option.color;
    slot.textContent = option.name;
    slotContainer.appendChild(slot);
});

//center the last slot div in the bottom middle of the container
const lastSlot = document.querySelector('.slot:last-child');
lastSlot.style.marginLeft = `${(slotContainer.offsetWidth - lastSlot.offsetWidth) / 2}px`;


let prizeHistory = [];

// Seleccionamos el contenedor donde se mostrará el historial de premios
const container2 = document.querySelector('.container2');


const myOptions = new Options(optionsObjectArray, true);
const audio = new Audio('audio.mp3'); // Asegúrate de poner la ruta correcta del archivo
audio.preload = 'auto';



const aplausos = new Audio('aplausos.mp3'); // Asegúrate de poner la ruta correcta del archivo
aplausos.preload = 'auto';

function start() {
    if(audio.currentTime!=0){
        audio.pause();
        audio.currentTime = 0; // Reiniciar el sonido si ya ha sido reproducido
    }

    if(aplausos.currentTime!=0){
        aplausos.pause();
        aplausos.currentTime = 0; // Reiniciar el sonido si ya ha sido reproducido
    }

    audio.play(); // Reproducir el sonido cuando comienza la tirada

    let slots = document.querySelectorAll('.slot');
    const totalRotations = 50; // Total de 50 rotaciones
    let rotations = 0;

    // coloca los nombres originales
    for(let i = 0; i < slots.length; i++) {
        slots[i].textContent = optionsObjectArray[i].name;
    }

    const colors = ['black', 'white', 'yellow'];
    let currentColorIndex = 0;

    // Función para cambiar el color de fondo
    function changeBackgroundColor() {
        document.body.style.backgroundColor = colors[currentColorIndex];
        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }

    const colorInterval = setInterval(changeBackgroundColor, 500);
    startButton.disabled = true; // Deshabilitar el botón de inicio

    // Función para ejecutar la animación de los slots
    function animateSlot() {
        // Realiza la animación de todos los slots, pero no cambia la opción seleccionada aún
        slots.forEach(slot => {
            slot.classList.add('slot-animation'); // Agregar la clase de animación
        });

        setTimeout(() => {
            slots.forEach(slot => {
                slot.classList.remove('slot-animation'); // Quitar la clase después de la animación
            });
        }, 500); // Tiempo de duración de la animación (coincide con la animación de 500ms)

        rotations++;
        if (rotations < totalRotations) {
            // Continúa la animación
            setTimeout(animateSlot, 40); // Control de velocidad de la animación
        } else {
            // Cuando las rotaciones lleguen al final, seleccionamos la opción ganadora
            stopSlot(colorInterval);
            
        }
    }

    let isModalVisible = false; // Variable para verificar si el modal ya está visible

function stopSlot(colorInterval) {
    const selectedOption = myOptions.getOptionRandomly(); // Obtener la opción final una vez que se detienen las rotaciones
    slots.forEach(slot => {
        slot.textContent = selectedOption.name; // Mostrar la opción ganadora en todos los slots
    });

    // Mostrar alerta de ganador
    const winnerMessage = document.getElementById('winner-message');
    winnerMessage.textContent = `¡Ganaste: ${selectedOption.name}!`;

    // Mostrar el modal solo si no está visible
    const winnerModal = document.getElementById('winner-modal');

    if (!isModalVisible) {
        winnerModal.style.display = 'flex'; // Hacer visible el modal
        winnerModal.classList.remove('fade-out'); // Eliminar cualquier clase de desvanecimiento previo
        winnerModal.classList.add('fade-in'); // Añadir la clase de animación de entrada
        isModalVisible = true; // Marcar el modal como visible
    }

    // Si el premio es "1 Franela", reproducir aplausos
    if (selectedOption.name === '1 Franela') {
        aplausos.play();
    }

    // Iniciar lluvia de monedas (si aplica)
    startCoinRain();

    // Esperar a que termine la animación de entrada antes de aplicar la de salida
    setTimeout(() => {
        // Después de 3 segundos, iniciar la animación de salida
        winnerModal.classList.remove('fade-in'); // Eliminar la clase de animación de entrada
        winnerModal.classList.add('fade-out'); // Añadir la clase de animación de salida
        
        // Configurar el timeout para ocultar el modal después de la animación de salida
        setTimeout(() => {
            clearInterval(colorInterval); // Detener el cambio de color
            document.body.style.backgroundColor = "#011b3e";
            winnerModal.style.display = 'none'; // Ocultar el modal después de la animación
            isModalVisible = false; // Marcar el modal como no visible después de cerrarlo
            startButton.disabled = false; // Habilitar el botón de inicio

        }, 500); // 500 ms para coincidir con la duración de la animación de salida
    }, 3000); // Mostrar el modal durante 3 segundos

    // Agregar el premio al historial
    prizeHistory.push(selectedOption.name);

    // Mostrar el historial de premios en el div container2
    updatePrizeHistory();
}

    // Función para actualizar el historial de premios
    function updatePrizeHistory() {
        // Limpiar el contenido previo
        container2.innerHTML = '<h2>Premios Reclamados:</h2>';

        // Crear una lista de premios obtenidos
        prizeHistory.forEach((prize, index) => {
            const prizeItem = document.createElement('p');
            prizeItem.textContent = `#${index + 1} - ${prize}`;
            container2.appendChild(prizeItem);
        });
    }

    animateSlot(); // Iniciar la animación
}

const startButton = document.querySelector('#boton');
startButton.addEventListener('click', start);


// coins

function createCoin() {
    const coin = document.createElement('div');
    coin.classList.add('coin');

    // Generar posición y duración aleatorias
    const randomX = Math.floor(Math.random() * window.innerWidth);
    const randomDuration = Math.random() * 3 + 2; // Entre 2 y 5 segundos

    // Aplicar estilos
    coin.style.left = `${randomX}px`;
    coin.style.animationDuration = `${randomDuration}s`;

    // Agregar la moneda al contenedor
    const coinRain = document.getElementById('coin-rain');
    coinRain.appendChild(coin);

    // Eliminar la moneda una vez que termina la animación
    setTimeout(() => {
        coin.remove();
    }, randomDuration * 1000);
}

function startCoinRain() {
    const coinCount = 125; // Número de monedas a generar
    for (let i = 0; i < coinCount; i++) {
        setTimeout(createCoin, i * 20); // Añade un ligero retraso entre monedas
    }
}
