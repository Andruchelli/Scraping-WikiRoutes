function remind() { // функция для отправки напоминаний в Телеграм (столбец G)
  const book_1 = SpreadsheetApp.getActive();
  const sheet_1 = book_1.getSheetByName('Links');
  const data_1 = sheet_1.getDataRange().getValues(); // в переменную data записываем все данные с листа

  data_1.shift(); // убираем заголовки (первую строку)
  //console.log(data_1)

  const clientIdChat_1 = "///////";
  const todayDate_1 = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy"); // текущая дата
  //console.log(todayDate_1)
  const todayDate_unix_1 = new Date(todayDate_1.split(".").reverse().join(".")).getTime(); // текущая дата в формате unix time
  //console.log(todayDate_unix_1)

  for (i = 0; i < data_1.length; i++) {
    if (data_1[i][6] == '') {

    }
    else {
      if (data_1[i][6] == todayDate_1) { // сравниваем текущую дату с датой в столбце G (напоминание)
        let message_1 = `Просили напомнить о маршруте № ${data_1[i][1]}\nЗапрос от: <u>${data_1[i][2]}</u>\nКомментарий: ${data_1[i][3]}`; // формирование сообщения
        sendText_1(clientIdChat_1, message_1);
        Utilities.sleep(3000);
      }
      else {

      }
    }

  }

}

function sendText_1(clientIdChat_1, text) { // функция для отправки сообщения в телеграм
  const token_1 = "///////////"; // токен чат-группы в телеграме
  let data_T1 = {
    method: 'sendMessage',
    chat_id: String(clientIdChat_1),
    text: text,
    parse_mode: 'HTML'
  };
  let options_1 = {
    method: 'post',
    payload: data_T1
  };
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token_1 + '/', options_1)
}

function runOnce() { // функция для запуска работы триггера. Запускается один раз
  trigger_();
}

function trigger_() { // функция для создания точечного триггера, который будет отрабатывать 1 раз в сутки (после отработки текущий триггер удаляется и создаётся новый с началом времени работы через сутки (24 часа))
  try {
    triggerAction();
  } catch (error) {
    console.error(error.message, error);
  } finally {
    var hours = 08;
    var minutes = 10;
    var seconds = 15;
    var now = new Date();
    var nextTime = new Date();
    nextTime.setHours(0, 0, 24 * 3600 + hours * 3600 + minutes * 60 + seconds);
    var delta = nextTime.getTime() - now.getTime();
    ScriptApp.newTrigger('trigger_')
      .timeBased()
      .after(delta)
      .create();
  }
}

function triggerAction() { // функция, в которой лежит функция, которую должен отработать триггер
  remind()
}
