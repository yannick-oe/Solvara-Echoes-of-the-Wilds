export class ImageCache { // Diese Klasse lädt Bilder und merkt sie sich.
  constructor() { // Hier starten wir den Cache.
    this.cache = {}; // In diesem Objekt speichern wir: Pfad -> Bild.
  } // Ende vom Konstruktor.

  async loadAll(paths) { // Diese Funktion lädt viele Bilder auf einmal.
    const uniquePaths = [...new Set(paths)]; // Doppelte Pfade werden entfernt.
    const tasks = []; // Hier sammeln wir Lade-Aufgaben.

    for (let i = 0; i < uniquePaths.length; i++) { // Wir gehen jeden Pfad einzeln durch.
      tasks.push(this.loadOne(uniquePaths[i])); // Für jeden Pfad starten wir einen Lade-Task.
    } // Ende Schleife.

    await Promise.all(tasks); // Wir warten, bis wirklich alle Bilder fertig geladen sind.
  } // Ende von loadAll.

  get(path) { // Diese Funktion holt ein Bild aus dem Cache.
    return this.cache[path]; // Wir geben das gespeicherte Bild zurück.
  } // Ende von get.

  loadOne(path) { // Diese Funktion lädt genau ein Bild.
    let self = this; // Wir speichern `this`, damit wir es im Callback nutzen können.

    return new Promise(function (resolve, reject) { // Wir geben ein Promise zurück, das später fertig wird.
      const image = new Image(); // Wir erzeugen ein neues Bild-Objekt.

      image.onload = function () { // Wenn das Bild erfolgreich geladen wurde...
        self.cache[path] = image; // ...speichern wir es im Cache.
        resolve(image); // ...und melden Erfolg.
      }; // Ende onload.

      image.onerror = function () { // Wenn das Bild nicht geladen werden konnte...
        reject(new Error(`Image could not be loaded: ${path}`)); // ...melden wir einen Fehler.
      }; // Ende onerror.

      image.src = path; // Hier starten wir den eigentlichen Ladevorgang.
    }); // Ende Promise.
  } // Ende von loadOne.
} // Ende der ImageCache-Klasse.