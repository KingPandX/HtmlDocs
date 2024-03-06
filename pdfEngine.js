import puppeteer from "puppeteer";

async function pdfGen(pageContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(pageContent);
    await page.pdf({ path: 'yourDoc.pdf', format: 'A4' });
    await browser.close();
}

export default pdfGen;