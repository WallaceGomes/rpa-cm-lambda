import chromium from 'chrome-aws-lambda';
import recaptcha from 'puppeteer-extra-plugin-recaptcha';
import { addExtra } from 'puppeteer-extra';

exports.handler = async function (event) {
    const { queryStringParameters } = event;
    const { user, pass, url, program } = queryStringParameters;

    let response;

    try {
        switch (program) {
            case 'azul':
                response = await scrapAzul(user, pass, url);
                break;
        
            default:
                response = await scrap(user, pass, url);
                break;
        }

    } catch (error) {
        response = {
			error:
				'Ocorreu um erro durante a operação. Cheque seus dados e tente novamente.',
		};
    }

    return response;
}

async function scrap(user, pass, url) {
	const puppeteerExtra = addExtra(chromium.puppeteer as any);

	const browser = await puppeteerExtra.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

	const page = await browser.newPage();

    page.setDefaultNavigationTimeout(30000);

    console.log(`Loading page...:${url}`);
    await page.goto(url);

    console.log('page loaded!')
    await browser.close();

    return { miles: 'ok', expiryDate: 'ok' };
}

async function scrapAzul(user, pass, url) {

    const puppeteerExtra = addExtra(chromium.puppeteer as any);

	const browser = await puppeteerExtra.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    //página de extrato https://tudoazul.voeazul.com.br/group/azul/activity-history
    //página de login https://apps.voeazul.com.br/TudoAzulRenew/

	const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    console.log(`Loading page...:${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('#agentName');
    console.log('type login');
    await page.type('#agentName', user, {
        delay: 50,
    });
    await page.waitForSelector('#password');
    console.log('type password');
    await page.type('#password', pass, {
        delay: 50,
    });
    await page.click('#btnEfetuarLogin');
    console.log('click login');

    //if the form has some error the rpa will not find the button
    // await page.waitForSelector(
    //     'a.btn.btn-block.btn-outline.btn-outline-light',
    //     { timeout: 30000 },
    // );
    // await page.click('a.btn.btn-block.btn-outline.btn-outline-light');

    await page.goto('https://tudoazul.voeazul.com.br/group/azul/activity-history', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#balance');
    const balance = await page.evaluate(() => {
        const auxBalance = document.getElementById('balance');
        const miles = auxBalance.textContent;
        return miles;
    });

    // const expDate = await page.evaluate(() => {
    // 	const auxDate = document.querySelector('.ng-binding.ng-scope');
    // 	const date = auxDate.innerText;
    // 	if (date) {
    // 		return date.replace('A vencer (', '').replace(')', '').replace(':', '');
    // 	}
    // });

    const expDate = page.$eval('.ng-binding.ng-scope', element => element.innerHTML);

    console.log(`Milhas : ${balance}`);
    console.log(`Date : ${expDate}`);
    console.log('finish');

    await browser.close();

    return { miles: balance, expiryDate: expDate };
}

async function scrapLatam(user, pass, url) {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

	const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    console.log(`Loading page...:${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.goto('https://www.pontosmultiplus.com.br/login/');

    // console.log('Loading page...');
    await page.waitForSelector('#userid');
    // console.log('type login');
    await page.type('#userid', user, {
        delay: 50,
    });
    await page.waitForSelector('#password');
    // console.log('type password');
    await page.type('#password', pass, {
        delay: 50,
    });
    // await page.waitForTimeout(90000);
    await page.click('button.btn');
    // console.log('click login');

    await page.waitForTimeout(500);
}