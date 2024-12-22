class ToggleButton{
  constructor() {
    this.isActive = false;
    this.createButton();
  }

  createButton() {
    const button = document.createElement('button');
    button.id = 'toggleButton';
    button.innerHTML = 'Start';

    // Ustawienia przycisku
    button.style.position = 'fixed';
    button.style.top = localStorage.getItem('buttonTop') || '10px';
    button.style.left = localStorage.getItem('buttonLeft') || '10px';
    button.style.zIndex = '9999';
    button.style.padding = '10px';
    button.style.backgroundColor = 'red';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    button.addEventListener('click', () => {
      this.isActive = !this.isActive;
      button.innerHTML = this.isActive ? 'Stop' : 'Start';
      button.style.backgroundColor = this.isActive ? 'green' : 'red';
    });

    // Funkcjonalność przeciągania
    button.addEventListener('mousedown', function(e) {
      let shiftX = e.clientX - button.getBoundingClientRect().left;
      let shiftY = e.clientY - button.getBoundingClientRect().top;

      function moveAt(pageX, pageY) {
        button.style.left = pageX - shiftX + 'px';
        button.style.top = pageY - shiftY + 'px';
      }

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      document.addEventListener('mousemove', onMouseMove);

      button.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        button.onmouseup = null;
        localStorage.setItem('buttonTop', button.style.top);
        localStorage.setItem('buttonLeft', button.style.left);
      };
    });

    button.ondragstart = function() {
      return false;
    };

    document.body.appendChild(button);
  }

  isButtonActive() {
    return this.isActive;
  }
}