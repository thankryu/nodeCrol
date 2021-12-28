const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio')
const sanitizeHtml = require('sanitize-html');
const dotenv = require("dotenv");
dotenv.config();

app.listen(8080, function() {
    console.log('listening on 8080')
});

// 네이버 테스트 미사용
app.get('/crol', function(request, response){
  (async () => {
    console.info("start")
    const browser = await puppeteer.launch({
        headless: false,        
        // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.
        slowMo : 1
    });
    const page = await browser.newPage();

    await Promise.all([
      page.goto('http://www.naver.com'),        // 테스트할 사이즈 주소입력
      page.waitForNavigation()
    ])
    

    let target = "//span[text()='쇼핑']/ancestor::a"        // span 태그가 클릭이 동작하지 않아 부모인 a tag를 찾아서 클릭이벤트 줌
    await page.waitForXPath(target)  // 화면 로딩이 덜 끝나서 못찾을수 있기에 일정시간 기다려줌.    
    let s = await page.$x(target)
    console.log('s!:::', s)
    s= s[0]      // page.$x()는 배열을 리턴하므로 [0] 으로 해서 첫번째 element를 사용함.
    
    // 클릭시 리다이렉트 되기에 기다려야함.
    await Promise.all([
        s.click(),
        page.waitForNavigation()
    ]) 

    // 쇼핑 리스트 값 가져오기
    // targetArr = "//ul[@id='categoryListPage1']/li/button"
    // let sArr = await page.$x(targetArr)
    // console.log('sArr', sArr);
    // for ( item of sArr ){
    //   const value = await item.evaluate(el => el.textContent);
    //   console.log('value', value.trim);
    // }

    // 값 넣어보기
    let searchTarget = "//input[@title='검색어 입력']"
    await page.waitForXPath(searchTarget)  // 화면 로딩이 덜 끝나서 못찾을수 있기에 일정시간 기다려줌.    
    let searchWordArr = await page.$x(searchTarget)
    let searchWord = searchWordArr[0]
    await searchWord.type('워킹패드')

    await page.evaluate(() => {
     document.querySelector("a[class='co_srh_btn _search N=a:SNB.search']").click();
    });

    await page.waitForTimeout(10000)     // 눈으로 확인하기 위해 3초간 멈춤
    await browser.close();              // 브라우저 종료
  })();
});

// 인스타 테스트 소스 참고용
app.get('/insta', function(request, response){
  (async () => {
    console.info("start")
    const browser = await puppeteer.launch({
        headless: false,        
        // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.
        slowMo : 1
    });
    const page = await browser.newPage();

    await Promise.all([
      page.goto('https://www.instagram.com/explore/tags/%ED%81%AC%EB%A6%AC%EC%8A%A4%EB%A7%88%EC%8A%A4/'),        // 테스트할 사이즈 주소입력
      page.waitForNavigation()
    ])
    

    let target = '//*[@id="react-root"]/section/main/article/div[1]/div/div/div[1]/div[1]/a'        // span 태그가 클릭이 동작하지 않아 부모인 a tag를 찾아서 클릭이벤트 줌
    console.log('target:::', target);
    await page.waitForXPath(target)  // 화면 로딩이 덜 끝나서 못찾을수 있기에 일정시간 기다려줌.        
    let s = await page.$x(target)
    console.log('s:::', s);
    s= s[0]      // page.$x()는 배열을 리턴하므로 [0] 으로 해서 첫번째 element를 사용함.
    
    // 클릭시 리다이렉트 되기에 기다려야함.
    await Promise.all([
        s.click(),
        page.waitForNavigation()
    ]) 

    // 쇼핑 리스트 값 가져오기
    // targetArr = "//ul[@id='categoryListPage1']/li/button"
    // let sArr = await page.$x(targetArr)
    // console.log('sArr', sArr);
    // for ( item of sArr ){
    //   const value = await item.evaluate(el => el.textContent);
    //   console.log('value', value.trim);
    // }

    // 값 넣어보기
    // let searchTarget = "//input[@title='검색어 입력']"
    // await page.waitForXPath(searchTarget)  // 화면 로딩이 덜 끝나서 못찾을수 있기에 일정시간 기다려줌.    
    // let searchWordArr = await page.$x(searchTarget)
    // let searchWord = searchWordArr[0]
    // await searchWord.type('워킹패드')

    // await page.evaluate(() => {
    //  document.querySelector("a[class='co_srh_btn _search N=a:SNB.search']").click();
    // });
    
    // await page.waitForTimeout(10000)     // 눈으로 확인하기 위해 3초간 멈춤
    // await browser.close();              // 브라우저 종료
  })();
});

// 인스타 크롤링 진행중
const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--window-size=1920,1080", "--disable-notifications"],
    });
    const page = await browser.newPage();
    page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto("https://instagram.com");

    // 로그인이 되었을때
    if (await page.$('a[href="/bot135791/"]')) {
      console.log("이미 로그인이 되어있습니다");
      // 로그인이 안됬을때
    } else {
      // 페이스북으로 로그인 버튼
      await page.waitForSelector(".KPnG0");
      await page.click(".KPnG0");
      await page.waitForNavigation(); //facebook 로그인으로 넘어가는것을 대기
      await page.waitForSelector("#email");
      await page.type("#email", process.env.EMAIL);
      await page.waitFor(1000);
      await page.type("#pass", process.env.PASSWORD);
      await page.waitFor(1000);
      await page.waitForSelector("#loginbutton");
      await page.click("#loginbutton");
      await page.waitForNavigation(); //instagram으로 넘어가는것을 대기
      console.log("로그인을 완료 하였습니다 ");
    }
    
    await page.waitForSelector("input[placeholder='검색']");

    await page.waitForSelector("input[placeholder='검색']");
    await page.type("input[placeholder='검색']", '크리스마스'); // 검색어 입력
    await page.keyboard.press('Enter'); // Enter Key

    await page.waitForSelector('.-qQT3');    
    let target  = "//div[@class='fuqBx ']/div/a";
    await page.waitForXPath(target);
    let searchArr = await page.$x(target);
    console.log('searchArr', searchArr); // 검색 목록 조회
    let search = searchArr[0];

    
    await Promise.all([
      search.click(),
      page.waitForNavigation()
  ])
  
    // await page.click('.-qQT3'); 
    

    // 
    // const newPost = await page.evaluate(() => {
    //   // 더보기를 눌러서 진행해준다
    //   if(document.querySelector("button.sXUSN")){
    //     document.querySelector("button.sXUSN").click();
    //   }
    //   //게시글 가져오기 
    //   const article = document.querySelector("article:first-of-type");
    //   console.log(article);
    //   const postId =
    //     document.querySelector(".c-Yi7") &&
    //     document.querySelector(".c-Yi7").href;
    //   console.log(postId);
    //   const name =
    //     article.querySelector("a.sqdOP") &&
    //     article.querySelector("a.sqdOP").textContent;
    //   const image =
    //     article.querySelector(".KL4Bh img") &&
    //     article.querySelector(".KL4Bh img").src;
    //   console.log(image);
    //   const content =
    //     article.querySelector(".QzzMF:first-of-type") &&
    //     article.querySelector(".QzzMF:first-of-type").textContent;

    //   return {
    //     postId,
    //     name,
    //     image,
    //     content,
    //   };
    // });

    // console.log(newPost);
  } catch (err) {
    console.log(err);
  }
};

// 실제 테스트
app.get('/test', function(request, response){
  crawler();
});