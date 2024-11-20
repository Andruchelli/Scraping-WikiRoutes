function delLines() { // функция для удаления ненужных строк (с просроченной датой)
  const book_2 = SpreadsheetApp.getActive();
  const sheet_2 = book_2.getSheetByName("Links");
  const data_2 = sheet_2.getDataRange().getValues(); // в переменную data_2 записываем все данные с листа Links
  
  const todayDate_2 = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy"); // текущая дата
  //console.log(todayDate_2)
  const todayDate_unix_2 = new Date(todayDate_2.split(".").reverse().join(".")).getTime(); // текущая дата в формате unix time
  data_2.shift(); // убираем заголовки (первую строку)

  for (i = data_2.length - 1; i >= 0; i--) {
    if (data_2[i][4] == '' && data_2[i][6] == '') { // условие для случая, если полученная/спарсенная дата и дата напоминания отсутствуют
      
    }

    else if (data_2[i][4] != '' && data_2[i][6] == '') { // условие для просроченной полученной/спарсенной даты
      if ((data_2[i][5] == true) && (todayDate_unix_2 - data_2[i][4].getTime() > 432000000)) { // 432000000 = 5 дней в формате unix time
        sheet_2.deleteRow(i + 2);
        console.log(i + 2)
      }
    }
    else if (data_2[i][6] != '') { // // условие для просроченной даты напоминания
      if (todayDate_unix_2 - data_2[i][6].getTime() > 432000000) {
        sheet_2.deleteRow(i + 2);
        console.log(i + 2)
      }
    }
  }
}

function runOnce_1() { // функция для запуска работы триггера. Запускается один раз
  trigger1_();
}

function trigger1_() { // функция для создания точечного триггера, который будет отрабатывать 1 раз в сутки (после отработки текущий триггер удаляется и создаётся новый с началом времени работы через сутки (24 часа))
  try {
    triggerAction_1();
  } catch (error) {
    console.error(error.message, error);
  } finally {
    var hours = 23;
    var minutes = 50;
    var seconds = 15;
    var now = new Date();
    var nextTime = new Date();
    nextTime.setHours(0, 0, 24 * 3600 + hours * 3600 + minutes * 60 + seconds);
    var delta = nextTime.getTime() - now.getTime();
    ScriptApp.newTrigger('trigger1_')
      .timeBased()
      .after(delta)
      .create();
  }
}

function triggerAction_1() { // функция, в которой лежит функция, которую должен отработать триггер
  delLines()
}

// https://www.youtube.com/watch?v=TxLp005LyrE
// https://apps-script-snippets.contributor.pw/snippets/sheets/delete_move_rows_by_conditional/