function diffDates() { // функция для сравнения дат, чтобы передать данные боту
  const book = SpreadsheetApp.getActive();
  const sheet = book.getSheetByName("Links");
  
  const data = sheet.getDataRange().getValues(); // в переменную data записываем все данные с листа Links
  data.shift(); // убираем заголовки, чтобы убрать первую строку
  //console.log(data)

  const clientIdChat = "///"; // id чат-группы в телеграме
  const checkbox = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build(); // чекбокс

  for (i = 0; i < data.length; i++) {
    console.log(data[i][1])
    if (data[i][0] != '' && (data[i][6] == '' || data[i][6] == false)) { // условие для случая, если дата не пустая (нет ссылки) и значение чекбокса отсутствует, либо равно false
      if (data[i][4] != data[i][5]) { // сравниваем начальную  и полученную в ходе сбора данных даты
        let message = `Есть изменения в маршруте № ${data[i][1]}\nЗапрос от: <u>${data[i][2]}</u>\nКомментарий: ${data[i][3]}`; // формирование сообщения для отправки боту
        sendText(clientIdChat, message);
        let check = sheet.getRange(i + 2, 7).setDataValidation(checkbox).setValue(true); // после отправки сообщения в Телеграм устанавливаем чекбокс в значение true
        Utilities.sleep(3000);
      }
      else {
        //console.log(data[i])
      }
    }
  }
}

function sendText(clientIdChat, text) { // функция для отправки сообщения в телеграм
  const token = "///"; // токен чат-группы в телеграме
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

// https://www.youtube.com/watch?v=kp5dSl-ev08
// https://it4each.com/blog/parsing-skraping-s-pomoshchiu-google-apps-script