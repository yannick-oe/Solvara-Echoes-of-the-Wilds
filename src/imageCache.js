export class ImageCache { // Deklariert eine Klasse, die von anderen Modulen verwendet werden kann.
  // Diese Funktion verarbeitet das Verhalten "constructor" in dieser Datei.
  constructor() { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    this.cache = {}; // Speichert Daten in der aktuellen Objektinstanz.
  }

  // Diese Funktion verarbeitet das Verhalten "loadAll" in dieser Datei.
  async loadAll(paths) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    const uniquePaths = [...new Set(paths)]; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.
    const tasks = []; // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

    // Diese Funktion verarbeitet das Verhalten "for" in dieser Datei.
    for (let i = 0; i < uniquePaths.length; i++) { // Iteriert in einer Schleife ueber Elemente oder Indizes.
      tasks.push(this.loadOne(uniquePaths[i])); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
    }

    await Promise.all(tasks); // Wartet, bis die asynchrone Operation abgeschlossen ist.
  }

  // Diese Funktion verarbeitet das Verhalten "get" in dieser Datei.
  get(path) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    return this.cache[path]; // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
  }

  // Diese Funktion verarbeitet das Verhalten "loadOne" in dieser Datei.
  loadOne(path) { // Fuehrt diesen Schritt im aktuellen Ablauf aus.
    let self = this; // Erzeugt eine lokale Variable, die sich aendern kann.

    return new Promise(function (resolve, reject) { // Gibt die Kontrolle (und optional einen Wert) an den Aufrufer zurueck.
      const image = new Image(); // Erzeugt eine lokale Konstante fuer diesen Geltungsbereich.

      image.onload = function () { // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        self.cache[path] = image; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        resolve(image); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      };

      image.onerror = function () { // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
        reject(new Error(`Image could not be loaded: ${path}`)); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
      };

      image.src = path; // Berechnet und speichert einen Wert fuer die spaetere Verwendung.
    }); // Ruft eine Funktion auf, um diesen Schritt auszufuehren.
  }
}
