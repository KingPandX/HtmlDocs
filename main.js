/**
 * Import CSS file and Monaco Editor library.
 */
import './style.css';
import * as monaco from 'monaco-editor';

/**
 * Get the HTML editor element, CSS editor element, style element, and page container element.
 */
const editorElement = document.getElementById('editorHTML');
const editorCssElement = document.getElementById('editorCSS');
let StyleElement = document.getElementById('CSS');
const pagesCont = document.getElementById('pageContainer');

/**
 * Create HTML and CSS editors using Monaco Editor.
 */
const editorhtml = createEditor(editorElement, 'html', '');
const editorcss = createEditor(editorCssElement, 'css', '');

/**
 * Set the initial value of the CSS editor to the content of the style element.
 */
editorcss.setValue(StyleElement.innerHTML);

/**
 * Initialize an empty array to store pages and a variable to store the currently selected page element.
 */
let pages = [];
let actaulElement

/**
 * Function to add a new page.
 */
function AddPage() {
  const element = document.createElement('div');
  const elementCont = document.createElement('div');

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete';
  deleteButton.classList.add('deleteButton');
  deleteButton.classList.add('btn');
  deleteButton.addEventListener('click', function () {
    element.remove();
    pages.splice(pages.indexOf(page), 1);
  });
  element.appendChild(deleteButton);

  element.classList.add('page');
  element.id = `page${pages.length}`;

  elementCont.classList.add('content');

  element.appendChild(elementCont);

  pagesCont.appendChild(element);

  const model = monaco.editor.createModel(elementCont.innerHTML, 'html');

  const page = {
    id: pages.length,
    element,
    model,
    content: elementCont
  };

  pages.push(page);

  readPage();
}

/**
 * Function to attach click event listeners to page elements.
 */
function readPage() {
  const contents = document.getElementsByClassName('content');
  for (let i = 0; i < contents.length; i++) {
    contents[i].addEventListener('click', function () {
      editorhtml.setModel(pages[i].model);
      actaulElement = pages[i].content;
    });
  }
}

/**
 * Add a page when the "Add" button is clicked.
 */
AddPage();

document.getElementById('addButton').addEventListener('click', function () {
  AddPage();
});

/**
 * Update the layout of the HTML and CSS editors when the transition ends.
 */
document.getElementById('editor').addEventListener('transitionend', function () {
  editorhtml.layout();
  editorcss.layout();
});

/**
 * Update the content of the actual page element when the HTML editor content changes.
 */
editorhtml.onDidChangeModelContent(function () {
  actaulElement.innerHTML = editorhtml.getValue();
});

/**
 * Update the content of the style element when the CSS editor content changes.
 */
editorcss.onDidChangeModelContent(function () {
  StyleElement.innerHTML = editorcss.getValue();
});

/**
 * Set up the Monaco Editor environment for different languages.
 */
self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    const getWorkerModule = (moduleUrl, label) => {
      return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl), {
        name: label,
        type: 'module'
      });
    };

    switch (label) {
      case 'json':
        return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
      case 'css':
      case 'scss':
      case 'less':
        return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker?worker', label);
      case 'html':
      case 'handlebars':
      case 'razor':
        return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker?worker', label);
      case 'typescript':
      case 'javascript':
        return getWorkerModule('/monaco-editor/esm/vs/language/typescript/ts.worker?worker', label);
      default:
        return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker?worker', label);
    }
  }
};

/**
 * Function to create a Monaco Editor instance.
 * @param {HTMLElement} dom - The DOM element to attach the editor to.
 * @param {string} language - The language mode of the editor.
 * @param {string} value - The initial value of the editor.
 * @returns {monaco.editor.IStandaloneCodeEditor} The created editor instance.
 */
function createEditor(dom, language, value) {
  return monaco.editor.create(dom, {
    value,
    language,
    theme: 'vs-dark',
    codeLens: true,
  });
}

/**
 * Export the content as a PDF when the "Export" button is clicked.
 */
document.getElementById('Export').addEventListener('click', function () {
  alert('PDF will be downloaded');
  mergeInfo()
});

/**
 * Merge the content of all pages and generate a PDF.
 */
function mergeInfo() {
  const body = document.createElement('div');
  const styles = document.createElement('style');
  const localpages = [...pages];

  styles.innerHTML = StyleElement.innerHTML;
  body.appendChild(styles);
  for (let i = 0; i < localpages.length; i++) {
    const clonedElement = localpages[i].element.cloneNode(true);
    body.appendChild(clonedElement);
  }

  const content = body.outerHTML.replace(/<button\s+class="deleteButton btn">Delete<\/button>/g, "")
  console.log(content);
  pdfGen(content);
}

/**
 * Generate a PDF from the given page content.
 * @param {string} pageContent - The content of the page to generate the PDF from.
 */
async function pdfGen(pageContent) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "text/plain");

  const raw = `${pageContent}`;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  fetch("http://localhost:3000/generate-pdf", requestOptions)
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'file.pdf';
      link.click();
      URL.revokeObjectURL(url);
    })
    .catch((error) => console.error(error));
}

/**
 * Save the data (pages and style) as a JSON file.
 */
function saveData() {
  const data = {
    pages: pages.map(page => ({
      id: page.id,
      content: page.content.innerHTML
    })),
    style: StyleElement.innerHTML
  };
  const jsonData = JSON.stringify(data);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'data.json';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Load data from a JSON file.
 * @param {File} file - The JSON file to load the data from.
 */
function loadData(file) {
  pages = [];
  const reader = new FileReader();
  reader.onload = function (event) {
    const jsonData = event.target.result;
    const data = JSON.parse(jsonData);
    pagesCont.innerHTML = '';
    StyleElement.innerHTML = '';
    data.pages.forEach(pageData => {
      const element = document.createElement('div');
      const elementCont = document.createElement('div');
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = 'Delete';
      deleteButton.classList.add('deleteButton');
      deleteButton.classList.add('btn');
      deleteButton.addEventListener('click', function () {
        element.remove();
        pages.splice(pages.findIndex(page => page.id === pageData.id), 1);
      });
      element.appendChild(deleteButton);
      element.classList.add('page');
      element.id = `page${pageData.id}`;
      elementCont.classList.add('content');
      elementCont.innerHTML = pageData.content;
      element.appendChild(elementCont);
      pagesCont.appendChild(element);
      const model = monaco.editor.createModel(elementCont.innerHTML, 'html');
      const page = {
        id: pageData.id,
        element,
        model,
        content: elementCont
      };
      pages.push(page);
      readPage();
    });
    StyleElement.innerHTML = data.style;
    editorcss.setValue(data.style);
  };
  reader.readAsText(file);
}

/**
 * Save the data as a JSON file when the "Save Data" button is clicked.
 */
document.getElementById('SaveData').addEventListener('click', function () {
  saveData();
});

/**
 * Load data from a JSON file when the file input changes.
 * @param {Event} event - The change event of the file input.
 */
document.getElementById('LoadData').addEventListener('change', function (event) {
  const file = event.target.files[0];
  loadData(file);
});
