<template>
  <div id="i18n-trans">
    <div id="i18nt-file" class="i18nt-button" @dragover.prevent @drop.prevent.stop="onDropFile">
      拖拽要翻译的文件至此
      <br>Drag and drop files to translate here
    </div>
    <div id="i18nt-reset" class="i18nt-button" @click="reset">
      重置
      <br>Reset
    </div>
    <div id="i18nt-reset" class="i18nt-button" @click="save">
      保存
      <br>Save
    </div>
    <a id="downlink"></a>
    <div id="i18nt-download" class="i18nt-button" @click="download">
      下载翻译结果
      <br>Download translated files
    </div>
    <input
      type="file"
      @change="importFile(this)"
      id="imFile"
      style="display: none"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
    >
    <div id="i18nt-export" class="i18nt-button" @click="downloadFile(excelArr)">
      Excel 导出
      <br>Excel export
    </div>
    <div id="i18nt-export" class="i18nt-button" @click="uploadFile()">
      Excel 导入
      <br>Excel export
    </div>
    <div class="i18nt-table">
      <table>
        <thead>
          <tr>
            <th width="20%">Name</th>
            <th width="40%">Value</th>
            <th width="40%">Translated</th>
          </tr>
        </thead>
        <tbody id="i18nt-box"></tbody>
      </table>
    </div>
  </div>
</template>

<script>
import XLSX from "xlsx";
export default {
  name: "I18nTrans",
  data() {
    return {
      protoObject: null,
      outputObject: null,
      dropBox: null,
      inputBox: null,
      index: 0,
      excelArr: [],
      currentArrName: "",
      outFile: "", // 导出文件el
      imFile: "", // 导入文件el
      excelData: ""
    };
  },
  mounted() {
    this.dropBox = this.$el.querySelector("#i18nt-file");
    this.inputBox = this.$el.querySelector("#i18nt-box");
    this.outFile = this.$el.querySelector("#downlink");
    this.imFile = this.$el.querySelector("#imFile");

    const isSave = localStorage.getItem("isSave");
    if (isSave) {
      const protoObject = localStorage.getItem("protoObject");
      const outputObject = localStorage.getItem("outputObject");
      const excelArr = localStorage.getItem("excelArr");
      try {
        this.protoObject = JSON.parse(protoObject);
        this.outputObject = JSON.parse(outputObject);
        this.excelArr = JSON.parse(excelArr);
      } catch (err) {
        this.reset();
        alert("解析失败，请向技术人员确认文件是否损坏");
      }
      this.parseInputBox(this.outputObject, 0, this.protoObject);
      // this.parseInputBox(JSON.parse(protoObject), 0);
      // console.log('this.excelArr', this.excelArr);
      // debugger
      const parseExcelArr = this.excelArr.map(x => {
        return {
          index: x[0],
          value: x[1],
          translated: x[2] || ''
        }
      })
      this.dealFile(parseExcelArr)
    }
  },
  methods: {
    analyzeData (data) {
      // 此处可以解析导入数据
      return data;
    },
    dealFile (data) {
      // 处理导入的数据
      this.imFile.value = "";
      this.fullscreenLoading = false;
      if (data.length <= 0) {
        this.errorDialog = true;
        this.errorMsg = "请导入正确信息";
      } else {
        this.excelData = data;
      }
      let inputs = document.querySelectorAll('.input');
      for (let i = 0; i < this.excelData.length; i++) {
        const items = this.excelData[i];
        this.excelArr[i][2] = items.translated;
        if(!inputs[i]) {
          continue
        }
        inputs[i].innerHTML = items.translated || '';
        inputs[i].addEventListener("blur", e => {
            const text = e.target.innerText;
            if (text.replace(/\s*/g, "").length !== 0) {
              const value = text.replace(/(^\s*)|(\s*$)|(\s*\n\s*)/g, "");
              this.excelArr[e.target.myIndex - 1][2] = value;
            }
            // console.log(this.excelArr, 'this.excelArr');
        });
      }

    },
    getCharCol (n) {
      // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
      let s = "";
      let m = 0;
      while (n > 0) {
        m = (n % 26) + 1;
        s = String.fromCharCode(m + 64) + s;
        n = (n - m) / 26;
      }
      return s;
    },
    fixdata (data) {
      // 文件流转BinaryString
      var o = "";
      var l = 0;
      var w = 10240;
      for (; l < data.byteLength / w; ++l) {
        o += String.fromCharCode.apply(
          null,
          new Uint8Array(data.slice(l * w, l * w + w))
        );
      }
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
      return o;
    },
    importFile() {
      // 导入excel
      this.fullscreenLoading = true;
      let obj = this.imFile;
      if (!obj.files) {
        this.fullscreenLoading = false;
        return;
      }
      var f = obj.files[0];
      var reader = new FileReader();
      let $t = this;
      reader.onload = function(e) {
        var data = e.target.result;
        if ($t.rABS) {
          $t.wb = XLSX.read(btoa(this.fixdata(data)), {
            // 手动转化
            type: "base64"
          });
        } else {
          $t.wb = XLSX.read(data, {
            type: "binary"
          });
        }
        let json = XLSX.utils.sheet_to_json($t.wb.Sheets[$t.wb.SheetNames[0]]);
        console.log(typeof json);
        $t.dealFile($t.analyzeData(json)); // analyzeData: 解析导入数据
      };
      if (this.rABS) {
        reader.readAsArrayBuffer(f);
      } else {
        reader.readAsBinaryString(f);
      }
    },
    uploadFile() {
      // 点击导入按钮
      this.imFile.click();
    },
    downloadFile(rs) {
      // 点击导出按钮
      // const tableHeader = ['index', 'level', 'location', 'value', 'translated'];
      const tableHeader = ["index", "value", "translated"];
      let data = [{}];
      for (let k in rs[0]) {
        data[0][k] = tableHeader[k];
      }
      data = data.concat(rs);
      this.downloadExl(data, "file");
    },
    downloadExl(json, downName, type) {
      // 导出到excel
      let keyMap = []; // 获取键
      for (let k in json[0]) {
        keyMap.push(k);
      }
      console.info("keyMap", keyMap, json);
      let tmpdata = []; // 用来保存转换好的json
      json
        .map((v, i) =>
          keyMap.map((k, j) =>
            Object.assign(
              {},
              {
                v: v[k],
                position:
                  (j > 25 ? this.getCharCol(j) : String.fromCharCode(65 + j)) +
                  (i + 1)
              }
            )
          )
        )
        .reduce((prev, next) => prev.concat(next))
        .forEach(function(v) {
          tmpdata[v.position] = {
            v: v.v
          };
        });
      let outputPos = Object.keys(tmpdata); // 设置区域,比如表格从A1到D10
      let tmpWB = {
        SheetNames: ["mySheet"], // 保存的表标题
        Sheets: {
          mySheet: Object.assign(
            {},
            tmpdata, // 内容
            {
              "!ref": outputPos[0] + ":" + outputPos[outputPos.length - 1] // 设置填充区域
            }
          )
        }
      };
      let tmpDown = new Blob(
        [
          this.s2ab(
            XLSX.write(
              tmpWB,
              {
                bookType: type === undefined ? "xlsx" : type,
                bookSST: false,
                type: "binary"
              } // 这里的数据是用来定义导出的格式类型
            )
          )
        ],
        {
          type: ""
        }
      ); // 创建二进制对象写入转换好的字节流
      var href = URL.createObjectURL(tmpDown); // 创建对象超链接
      this.outFile.download = downName + ".xlsx"; // 下载名称
      this.outFile.href = href; // 绑定a标签
      this.outFile.click(); // 模拟点击实现下载
      setTimeout(function() {
        // 延时释放
        URL.revokeObjectURL(tmpDown); // 用URL.revokeObjectURL()来释放这个object URL
      }, 100);
    },
    s2ab(s) {
      // 字符串转字符流
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    },
    onDropFile(e) {
      this.reset();
      const files = e.dataTransfer.files;
      if (files[0]) {
        this.dropBox.innerHTML = files[0].name + "<br>已加载 Loaded";
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = e => {
          try {
            this.protoObject = JSON.parse(e.target.result);
            this.outputObject = JSON.parse(e.target.result);
          } catch (err) {
            alert("解析失败，请向技术人员确认文件是否损坏");
          }
          this.parseInputBox(this.outputObject, 0);
        };
      } else {
        alert("没有选择文件");
      }
    },
    parseInputBox(obj, level, protoObject = false, OKey = "") {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          let protoValue;
          if (protoObject) {
            protoValue = protoObject[key];
          }
          if (typeof value === "string") {
            this.index++;
            const tr = document.createElement("tr");
            tr.className = "level-" + Math.min(level, 7);
            const tdKey = document.createElement("td");
            tdKey.className = "key";
            tdKey.innerHTML = key;
            const tdValue = document.createElement("td");
            tdValue.className = "value";
            tdValue.innerHTML = protoObject ? protoValue : value;
            const tdInput = document.createElement("td");
            tdInput.setAttribute("contenteditable", "plaintext-only");
            tdInput.className = "input";
            if (protoObject) {
              if (protoValue !== value) {
                tdInput.innerText = value;
              }
            }
            // debugger
            this.excelArr.push([
              this.index,
              /*
                用于 json 位置标识
                level,
                OKey + key + this.currentArrName,
              */
              value,
              protoValue
            ]);
            tdInput.myIndex = this.index;
            tdInput.addEventListener("blur", e => {
              const text = e.target.innerText;
              if (text.replace(/\s*/g, "").length !== 0) {
                const value = text.replace(/(^\s*)|(\s*$)|(\s*\n\s*)/g, "");
                obj[key] = value;
                this.excelArr[e.target.myIndex - 1][2] = value;
              }
            });
            tr.appendChild(tdKey);
            tr.appendChild(tdValue);
            tr.appendChild(tdInput);
            this.inputBox.appendChild(tr);
          } else if (Array.isArray(value)) {
            this.currentArrName = "_" + key;
            this.parseInputBox(value, level + 1, protoValue, key + "_arr_");
          } else if (typeof value === "object") {
            this.parseInputBox(value, level + 1, protoValue, key + "_obj_");
          }
        }
      }
    },
    download() {
      if (!this.outputObject) {
        return;
      }
      var eleLink = document.createElement("a");
      eleLink.download = "output.json";
      eleLink.style.display = "none";
      var blob = new Blob([JSON.stringify(this.outputObject, null, 2)]);
      eleLink.href = URL.createObjectURL(blob);
      document.body.appendChild(eleLink);
      eleLink.click();
      document.body.removeChild(eleLink);
    },
    save() {
      const protoObject = JSON.stringify(this.protoObject);
      const outputObject = JSON.stringify(this.outputObject);
      const excelArr = JSON.stringify(this.excelArr);
      console.log('this.excelArr', this.excelArr);

      localStorage.setItem("isSave", "true");
      localStorage.setItem("protoObject", protoObject);
      localStorage.setItem("outputObject", outputObject);
      localStorage.setItem("excelArr", excelArr);
      alert("Saved successfully");
    },
    reset() {
      this.protoObject = null;
      this.outputObject = null;
      this.dropBox.innerHTML =
        "拖拽要翻译的文件至此<br>Drag and drop files to translate here";
      this.inputBox.innerHTML = "";
      localStorage.removeItem("isSave");
      localStorage.removeItem("protoObject");
      localStorage.removeItem("outputObject");
      localStorage.removeItem("excelArr");
    }
  }
};
</script>

<style lang="stylus" scoped>
#i18n-trans
  width 100%
  height 100%
  overflow auto
.i18nt-button
  height 40px
  padding 5px 10px
  text-align center
  line-height 20px
  font-size 14px
  border-radius 6px
  border solid 1px #333
  margin 20px
#i18nt-file
  width 300px
  float left
#i18nt-reset
  width 60px
  float left
  cursor pointer
#i18nt-download
  width 200px
  float right
  cursor pointer
#i18nt-export
  width 120px
  float right
  cursor pointer
.i18nt-table
  width 100%
  padding 10px
  clear both
  box-sizing border-box
table
  width 100%
  border-spacing 0
  line-height 1.5em
  text-align left
  word-break break-all
  border-top solid 1px #333
  border-bottom solid 1px #333
  box-sizing border-box
  >>> tbody
    td
      border-top solid 1px #bbb
    .key
      font-weight bold
      font-size 14px
    .value
      padding 2px 0.5em
      color #666
      font-size 12px
    .input
      padding 2px 0.5em
      background-color #fffef6
      font-size 12px
      outline #666
      &:focus
        outline none
        background-color #fff9e5
    .level-0>.key
      padding-left 0.5em
    .level-1>.key
      padding-left 1em
    .level-2>.key
      padding-left 1.5em
    .level-3>.key
      padding-left 2em
    .level-4>.key
      padding-left 2.5em
    .level-5>.key
      padding-left 3em
    .level-6>.key
      padding-left 3.5em
    .level-7>.key
      padding-left 4em
</style>
