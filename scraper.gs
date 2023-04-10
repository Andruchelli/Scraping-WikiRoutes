function scraper() {
  const book = SpreadsheetApp.getActive();
  const sheet = book.getSheetByName('Links');

  const data = sheet.getDataRange().getValues(); // в переменную data записываем все данные с листа Links

  data.shift(); // убираем заголовки, чтобы убрать первую строку
  //console.log(data)

  const scrapeData = data.map(row => {
    const [url] = row; // в массив url записываем первый столбец из переменной data
    //console.log(row[5])
    return [extractFromUrl_(url, data)]; // возвращаем функцию extractFromUrl_
    })
  console.log(scrapeData)
  sheet.getRange(2, 5, scrapeData.length, scrapeData[0].length) // вставляем полученную дату в 5-ю колонку
  .setValues(scrapeData);
  return diffDates(scrapeData, sheet, data);

}

function extractFromUrl_(url, data) { // функция для проверки на валидность ссылки
  console.log(data[5])
  if (!url) return '';
  try { // обработка возникающей ошибки Attribute provided with no value: url
    html_arr = UrlFetchApp.fetch(url, {}).getContentText();
  } catch (e) {
    Logger.log("Could not fetch html for " + url + ": " + e);
    return 'err';
  }
  if (html_arr == null) {
    Logger.log("Could not fetch html");
    return '';
  }

  let p = 0; // переменная, отвечающая за последующий блок
  while (true) {
    let out = getBlock(html_arr, 'div', html_arr.indexOf('class="gwt-HTML qdexgEhGCfFx"', p));
    p = out[1] + 1;
    if (p == 0) break;

    let block = out[0];
    let date = getBlock(block, 'a', 0)[0].split("</strong> ")[1];
    console.log(date)
    return date;
  }
  return '';
}

function diffDates(scrapeData, sheet, data) { // функция для сравнения дат, чтобы передать данные боту
  const clientIdChat = "///////";
  const todayDate = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy"); // текущая дата
  console.log(todayDate)
  const todayDate_unix = new Date(todayDate.split(".").reverse().join(".")).getTime(); // текущая дата в формате unix time
  console.log(todayDate_unix)
  const eveDate_unix = todayDate_unix - 86400000; // день, предшествующий текущему (канун), в формате unix time
  console.log(eveDate_unix)
  const checkbox = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build(); // чекбокс

  for (i = 0; i < scrapeData.length; i++) {
    console.log(scrapeData[i])
    if (scrapeData[i][0] != '' && (data[i][5] == '' || data[i][5] == false)) { // условие для случая, если дата не пустая (нет ссылки) и значение чекбокса отсутствует либо равно false
      if ((new Date(scrapeData[i][0].split(".").reverse().join(".")).getTime() == todayDate_unix || new Date(scrapeData[i][0].split(".").reverse().join(".")).getTime() == eveDate_unix)) { // сравниваем полученную (спарсенную) дату с текущей и предшествующей сегодняшнему дню датами
        let message = `Есть изменения в маршруте № ${data[i][1]}\nЗапрос от: <u>${data[i][2]}</u>\nКомментарий: ${data[i][3]}`; // формирование сообщения для отправки боту
        sendText(clientIdChat, message);
        let check = sheet.getRange(i + 2, 6).setDataValidation(checkbox).setValue(true); // после отправки сообщения в Телеграм устанавливаем чекбокс в значение true
        Utilities.sleep(3000);
      }
      else {
        //console.log(data[i])
      }
    }
  }
}

function sendText(clientIdChat, text) { // функция для отправки сообщения в телеграм
  const token = "/////////"; // токен чат-группы в телеграме
  let data_T = {
    method: 'sendMessage',
    chat_id: String(clientIdChat),
    text: text,
    parse_mode: 'HTML'
  };
  let options = {
    method: 'post',
    payload: data_T
  };
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', options)
}

function getAttrName(html, attr, i) {
  let idxStart = html.indexOf(attr +'=' , i);
  if (idxStart == -1) return "Can't to find attr " + attr + ' !';
  idxStart = html.indexOf('"' , idxStart) + 1;
  let idxEnd = html.indexOf('"' , idxStart);
  return html.slice(idxStart,idxEnd).trim();
}

function getOpenTag(html, tag, idxStart) {
  let openTag = '<' + tag;
  let lenOpenTag = openTag.length;
  // where we are?
  if (html.slice(idxStart, idxStart + lenOpenTag) != openTag) {
    idxStart = html.lastIndexOf(openTag, idxStart);
    if (idxStart == -1) return "Can't to find openTag " + openTag + ' !';
  };
  // begin loop after openTag
  let idxEnd = html.indexOf('>', idxStart) + 1;
  if (idxStart == -1) return "Can't to find closing bracket '>' for openTag!";
  return html.slice(idxStart,idxEnd).trim();
}

function getBlock(html, tag, idxStart) {  // <tag .... > Block </tag>
  let openTag = '<' + tag;
  let lenOpenTag = openTag.length;
  let closeTag = '</' + tag + '>';
  let lenCloseTag = closeTag.length;
  let countCloseTags = 0;
  let iMax = html.length;
  let idxEnd = 0;
  // where we are?
  if (html.slice(idxStart, idxStart + lenOpenTag) != openTag) {
    idxStart = html.lastIndexOf(openTag, idxStart);
    if (idxStart == -1) return ["Can't to find openTag " + openTag + ' !', -1];
  };
  // change start - will start after openTag!
  idxStart = html.indexOf('>', idxStart) + 1;
  let i = idxStart;

  while (i <= iMax) {
    i++;
    if (i === iMax) {
      return ['Could not find closing tag for ' + tag, -1];
    };
    let carrentValue = html[i];
    if (html[i] === '<'){
      let closingTag = html.slice(i, i + lenCloseTag);
      let openingTag = html.slice(i, i + lenOpenTag);
      if (html.slice(i, i + lenCloseTag) === closeTag) {
        if (countCloseTags === 0) {
          idxEnd = i - 1;
          break;
        } else {
          countCloseTags -= 1;
        };
      } else if (html.slice(i, i + lenOpenTag) === openTag) {
        countCloseTags += 1;
      };
    };
  };
  return [html.slice(idxStart,idxEnd + 1).trim(), idxEnd];
}

// https://www.youtube.com/watch?v=kp5dSl-ev08
// https://it4each.com/blog/parsing-skraping-s-pomoshchiu-google-apps-script
