// Global Vars ========================
var csvURL = "Screens.csv";
var flowName = "Sample Flow";
var scrJSONArr = [];
var indexList = []; // list of indices for ScreenList
var pathList = []; // Path of indexList indices
var scrLeft = 0; // starting index of pathList

// Find Screen Index  ========================
function getId(sID) {
  retVal = -1;
  for (let index = 0; index < indexList.length; index++) {
    // console.log("getId Id:" + scrJSONArr[index].Id + ",sID:" + sID);
    if (sID.localeCompare(indexList[index].sID) == 0) {
      retVal = index;
      break;
    }
  }
  //   console.log("retVal:" + retVal);
  return retVal;
}

// Generate Path  ========================
function refreshPath(startID, AID) {
  if (pathList.length < 1) {
    //if Path is empty, start from Index 0
    pathList.push(0);
    startID = 0;
  } else {
    //Empty the rest of the path.
    pathList.splice(startID + 1, pathList.length);
  }
//   console.log("After Splicing Path:" + JSON.stringify(pathList));
  //start from the Action AID of the StartID value
  if (
    indexList[pathList[startID]].Actions &&
    indexList[pathList[startID]].Actions.length > 0
  ) {
    //path can progress
    var addID = -1;
    if (AID && AID < indexList[pathList[startID]].Actions.length) {
      addID = indexList[pathList[startID]].Actions[AID].aID;
    } else {
      addID = indexList[pathList[startID]].Actions[0].aID;
    }
    pathList.push(addID);
    var tmpStart = addID;
    while (
      tmpStart < indexList.length &&
      indexList[tmpStart].Actions &&
      indexList[tmpStart].Actions.length > 0
    ) {
      pathList.push(indexList[tmpStart].Actions[0].aID);
      tmpStart = indexList[tmpStart].Actions[0].aID;
    }
  }
//   console.log("Path:" + JSON.stringify(pathList));
}

// Generate Index List ========================
function genIdList() {
  indexList = [];
  $.each(scrJSONArr, function (ini, it) {
    tObj = {};
    tObj.aID = ini;
    tObj.sID = it.Id;
    tObj.Actions = [];
    tmpActions = it.Actions.trim().split(";");
    if (tmpActions.length > 0) {
      for (let idx = 0; idx < tmpActions.length; idx++) {
        var tmpAObj = {};
        var iA = tmpActions[idx];
        iAction = iA.trim().split("=");
        if (iAction.length > 1) {
          tmpAObj.aID = -1;
          tmpAObj.sID = iAction[1];
          tmpAObj.Action = iAction[0];
          tObj.Actions.push(tmpAObj);
        }
      }
    }
    indexList.push(tObj);
  });

  $.each(indexList, function (jn, io) {
    if (io.Actions.length > 0) {
      //   console.log(JSON.stringify(io.Actions));
      for (let iA = 0; iA < io.Actions.length; iA++) {
        // console.log("sID=" + io.Actions[iA].sID);
        // console.log("getId=" + getId(io.Actions[iA].sID));
        indexList[jn].Actions[iA].aID = getId(io.Actions[iA].sID);
      }
    }
  });

//   console.log(JSON.stringify(indexList, null, 4));
}

// Repaint Screen ========================

function repaintScreen() {
  var scrID = 0;
  startP = scrLeft;
  $(".cardcols").each(function () {
    var newHtml = "";
    if (startP < pathList.length) {
      scrObj = scrJSONArr[indexList[pathList[startP]].aID];
      // Image
      $(this).find("img.materialboxed").first().attr("src", scrObj.Img);
      $(this).find("img.materialboxed").first().attr("data-caption","[" + scrObj.Id + "] ." + scrObj.ScrName + " :-: " + scrObj.Desc);
      // Screen ID
      $(this)
        .find("span.scrID")
        .first()
        .text("[" + scrObj.Id + "] .");
      // Screen Name
      $(this).find("span.scrName").first().text(scrObj.ScrName);
      // Screen Desc
      $(this).find("span.scrDesc").first().text(scrObj.Desc);
      //Actions
      $(this).find("a.scrActClick").first().text("-");
      $(this).find("ul.scrActions").first().html(newHtml);
      if (
        indexList[pathList[startP]].Actions &&
        indexList[pathList[startP]].Actions.length > 1
      ) {
        for (
          let idA = 0;
          idA < indexList[pathList[startP]].Actions.length;
          idA++
        ) {
          if (
            indexList[pathList[startP]].Actions[idA].aID != pathList[startP + 1]
          ) {
            const actE = indexList[pathList[startP]].Actions[idA];
            newHtml += "<li>";
            newHtml +=
              '      <a class="scrActClick" href="#!" onclick="actionClick(' +
              scrID +
              "," +
              startP +
              "," +
              idA +
              ' )" >';
            newHtml +=
              '        <span class="col s10 blue-text text-darken-2 scrActName">';
            newHtml +=
              "          [" +
              actE.Action +
              "] " +
              scrJSONArr[indexList[actE.aID].aID].ScrName;
            newHtml += "        </span>";
            newHtml +=
              '        <span class="col s2 blue-text text-darken-2"><i class="material-icons">double_arrow</i></span>';
            newHtml += "      </a>";
            newHtml += "    </li>";
          }
        }
        if (newHtml.length > 0) {
          $(this).find("a.scrActClick").first().text("Actions");
        }
        $(this).find("ul.scrActions").first().html(newHtml);
      }
      startP++;
      scrID++;
    } else {
      // Image
      $(this).find("img.materialboxed").first().attr("src", "temp.png");
      $(this).find("img.materialboxed").first().attr("data-caption", "");
      // Screen ID
      $(this).find("span.scrID").first().text("[ ]");
      // Screen Name
      $(this).find("span.scrName").first().text("");
      // Screen Desc
      $(this).find("span.scrDesc").first().text("");
      //Actions
      $(this).find("a.scrActClick").first().text("-");
      $(this).find("ul.scrActions").first().html("");
    }
  });
}

// Handle Action Click ========================
function actionClick(scrID, pathID, actionID) {
//   console.log(
//     "scrID:" +
//       scrID +
//       ",pathID:" +
//       pathID +
//       ",actionID:" +
//       actionID +
//       " with scrLeft:" +
//       scrLeft
//   );
  refreshPath(pathID, actionID);
  if (scrID == 2) {
    scrLeft++;
  }
  repaintScreen();
}

// CSV 2 JSON ========================

function csvJSON(csv) {
  var lines = csv.split("\r\n");
  var result = [];
  var headers = lines[0].split(",");
  //   console.log(JSON.stringify(headers));
  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  //return result; //JavaScript object
  return result; //JSON
}

// Initialize ========================

$(function () {
  M.AutoInit();

  //====== Manage Clicks
  $(".scrNavLeft").click(function () {
    if (scrLeft > 0) {
      scrLeft--;
      repaintScreen();
    } else {
        M.toast({html: 'Starting Step. None prior !'})
    }
  });
  $(".scrNavRight").click(function () {
    if (scrLeft < pathList.length - 3) {
      scrLeft++;
      repaintScreen();
    } else {
        M.toast({html: 'Last Step. None after !'})
    }
  });
  $(".scrFlowName").each(function(){
      $(this).text(flowName);
  });
  //====== Load Data
  $.ajax({
    type: "GET",
    url: csvURL,
    dataType: "text",
    success: function (data) {
      jdata = csvJSON(data);
      scrJSONArr = JSON.parse(JSON.stringify(jdata));
      //   console.log(JSON.stringify(scrJSONArr));
      genIdList();
      refreshPath();
      repaintScreen();
      //   $.each(jdata, function (ini, it) {
      //     scrJSONArr.push(it);
      //   });
    },
  });
});
