(function(){
  //日期滑动控件
  //options 可配置参数
  //showNum:显示从今天开始的多少天，如：32
  //pageSize:一页显示多少日期 ，如：8
  //width:整个日期组件的宽度，如：1200px
  //cbFn:选中日期的回调函数
  $.fn.slideDate = function(options){
    var d = $(this).data("sildeDate");
    options = options||{};
    options.elem = $(this);
    if(d){
       d.destroy();
       d = null;
    }
    d = new SlideDate(options);
    $(this).data("sildeDate",d);
    return d;
  };
   function SlideDate(options){
       this.options = options||{};
       this.$elem = this.options.elem;
       this.init();
   };
   SlideDate.prototype = {
     constructor:SlideDate,
     init:function(){
         this.sheet = [];
         this.currentPage = 0;//当前处于第几页
         this.totalPage = 0;
         this.activeIndex = 0;//当前选中的index
         this.$elem.addClass("vetech-date");
         this.$navLeft = $('<a href="javascript:;" class="dateleft"><i class="iconfont icon-b-left"></i></a>');
         this.$navRight =  $('<a href="javascript:;" class="dateright able"><i class="iconfont icon-b-right"></i></a>');
         this.$navContent = $('<div class="vetech-date-box"><ul></ul></div>');
         this.$elem.append(this.$navLeft);
         this.$elem.append(this.$navContent);
         this.$elem.append(this.$navRight);
         this.render();
     },
     render:function(){
       var num = Number(this.options.showNum||16),zen,cont;
       this.pageSize = Number(this.options.pageSize||8);
       this.navWidth = 1200;
       zen = Math.floor(num/this.pageSize)
       zen = zen<1?1:zen;
       this.totalPage = zen;
       this.showNum = zen*this.pageSize;
       if(this.options.width){
         this.navWidth = parseInt(this.options.width);
       }
       this.$elem.css('width',(this.navWidth-2)+'px');
       this.navWidth -= 104;//减去导航和外框的宽度
       this.itemWidth = Number(this.navWidth/this.pageSize).toFixed(3)+"px";
       this.$navContent.css('width',this.navWidth+'px');
       for(var a=0;a<zen;a++){
         this.sheet.push(new Array(this.pageSize));
       }
       this.calcPage(new Date(),this.showNum);
       cont = this.getShowContent();
       this.$navContent.find("ul").append(cont);
       this.setActive(0);
       this.bindEvents();
     },
     calcPage:function(begin,num){
       var curObj,a,b;
       for(var m=0;m<num;m++){
         begin = this.dateAdd(begin,m>0?1:0);
         curObj = this.getDateParams(begin);
         a = Math.floor(m/this.pageSize);
         b = m%this.pageSize;
         this.sheet[a][b] = [curObj.yy,curObj.mm,curObj.dd].join('-');
       }
     },
     getShowContent:function(){
       var dom = document.createDocumentFragment(),$dom = $(dom),htm,curObj,qri,xq,ry,dd,dstr;
       var tept = "<li data-index='{{index}}' style='width:{{wd}}'><span class='rd'>{{rd}}</span><span class='rx'>{{rx}}</span><br/><span class='ry'>{{ry}}</span></li>";
       var arr = this.sheet[this.currentPage],len = arr.length;
       for(var x=0;x<len;x++){
         dstr = arr[x].split('-');
         dd = new Date(dstr[0],Number(dstr[1])-1,dstr[2]);
         curObj = this.getDateParams(dd);
         xq = this.calcWeekDay(curObj.zz);
         ry = this.e2c(curObj.yy,Number(curObj.mm)-1,curObj.dd);
         htm = tept.replace(/\{\{index\}\}/g,x).replace(/\{\{wd\}\}/g,this.itemWidth).replace(/\{\{rd\}\}/g,[curObj.mm,curObj.dd].join('-')).replace(/\{\{rx\}\}/g,xq).replace(/\{\{ry\}\}/g,ry);
         $dom.append(htm);
       }
       return $dom;
     },
     setActive:function(index){
       this.$navContent.find("li").removeClass("current");
       this.$navContent.find("li[data-index='"+index+"']").addClass("current");
       this.enableArrow();
       this.options.cbFn && this.options.cbFn(this.sheet[this.currentPage][index]);
     },
     next:function(){
       if(this.activeIndex<this.pageSize-1){
         this.activeIndex++;
       }else {
         this.activeIndex = 0;
         if(this.currentPage == this.totalPage-1){
           this.currentPage = 0;
         }else {
           this.currentPage++;
         }
         var cont = this.getShowContent();
         this.$navContent.find("ul").empty().append(cont);
       }
       this.setActive(this.activeIndex);
     },
     prev:function(){
       if(this.activeIndex>0){
         this.activeIndex--;
       }else{
         this.activeIndex = this.pageSize-1;
         if(this.currentPage>0){
           this.currentPage--;
         }else {
           this.currentPage = 0;
         }
         var cont = this.getShowContent();
         this.$navContent.find("ul").empty().append(cont);
       }
       this.setActive(this.activeIndex);
     },
     bindEvents:function(){
       this.$elem.on('click.slide','.dateleft',$.proxy(this.sildeLeft,this));
       this.$elem.on('click.slide','.dateright',$.proxy(this.sildeRight,this));
       this.$elem.on('click.slide','li',$.proxy(this.itemClick,this));
     },
     sildeLeft:function(e){
       if($(e.currentTarget).hasClass("able")){
         this.prev();
       }
     },
     sildeRight:function(e){
       if($(e.currentTarget).hasClass("able")){
         this.next();
       }
     },
     itemClick:function(e){
       var index = $(e.currentTarget).index();
       this.activeIndex = index;
       this.setActive(this.activeIndex);
     },
     enableArrow:function(){
       if(this.activeIndex == 0 && this.currentPage == 0){
         this.$navLeft.removeClass("able");
         this.$navRight.addClass("able");
       }else if(this.activeIndex == this.pageSize-1 && this.currentPage ==this.totalPage-1){
         this.$navRight.removeClass("able");
         this.$navLeft.addClass("able");
       }else{
         this.$navLeft.addClass("able");
         this.$navRight.addClass("able");
       }
     },
     dateAdd:function(d,dayNum){
       return new Date(d.getTime()+(86400000 * dayNum));
     },
     e2c:function(){
       //定义全局变量,用于计算农历
       var madd = [0,31,59,90,120,151,181,212,243,273,304,334];
       var tgString = "甲乙丙丁戊己庚辛壬癸",dzString = "子丑寅卯辰巳午未申酉戌亥",numString = "一二三四五六七八九十";
       var monString = "正二三四五六七八九十冬腊",weekString = "日一二三四五六",sx = "鼠牛虎兔龙蛇马羊猴鸡狗猪";
       var cYear, cMonth, cDay, TheDate;
       var CalendarData = [0xA4B, 0x5164B, 0x6A5, 0x6D4, 0x415B5, 0x2B6, 0x957, 0x2092F, 0x497, 0x60C96, 0xD4A, 0xEA5, 0x50DA9, 0x5AD, 0x2B6, 0x3126E, 0x92E, 0x7192D, 0xC95, 0xD4A, 0x61B4A, 0xB55, 0x56A, 0x4155B, 0x25D, 0x92D, 0x2192B, 0xA95, 0x71695, 0x6CA, 0xB55, 0x50AB5, 0x4DA, 0xA5B, 0x30A57, 0x52B, 0x8152A, 0xE95, 0x6AA, 0x615AA, 0xAB5, 0x4B6, 0x414AE, 0xA57, 0x526, 0x31D26, 0xD95, 0x70B55, 0x56A, 0x96D, 0x5095D, 0x4AD, 0xA4D, 0x41A4D, 0xD25, 0x81AA5, 0xB54, 0xB6A, 0x612DA, 0x95B, 0x49B, 0x41497, 0xA4B, 0xA164B, 0x6A5, 0x6D4, 0x615B4, 0xAB6, 0x957, 0x5092F, 0x497, 0x64B, 0x30D4A, 0xEA5, 0x80D65, 0x5AC, 0xAB6, 0x5126D, 0x92E, 0xC96, 0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95];
       TheDate = (arguments.length != 3) ? new Date() : new Date(arguments[0], arguments[1], arguments[2]);
       var total, m, n, k,isEnd = false,tmpry = "";
       var tmp = TheDate.getYear();
       (tmp<1900)?(tmp += 1900):'';
       total = (tmp - 1921) * 365 + Math.floor((tmp - 1921) / 4) + madd[TheDate.getMonth()] + TheDate.getDate() - 38;
       if (TheDate.getYear() % 4 == 0 && TheDate.getMonth() > 1) {
           total++;
       }
       for (m = 0; ; m++) {
           k = (CalendarData[m] < 0xfff) ? 11 : 12;
           for (n = k; n >= 0; n--) {
               if (total <= 29 + this.getBit(CalendarData[m], n)) {
                   isEnd = true;
                   break;
               }
               total = total - 29 - this.getBit(CalendarData[m], n);
           }
           if (isEnd) break;
       }
       cYear = 1921 + m;
       cMonth = k - n + 1;
       cDay = total;
       if (k == 12) {
           if (cMonth == Math.floor(CalendarData[m] / 0x10000) + 1) {
               cMonth = 1 - cMonth;
           }
           if (cMonth > Math.floor(CalendarData[m] / 0x10000) + 1) {
               cMonth--;
           }
       }
       if (cMonth < 1) {
           tmpry += "(闰)";
           tmpry += monString.charAt(-cMonth - 1);
       } else {
           tmpry += monString.charAt(cMonth - 1);
       }
       tmpry += "月";
       tmpry += (cDay < 11) ? "初" : ((cDay < 20) ? "十" : (cDay == 20) ? "二十" : ((cDay < 30) ? "廿" : "三十"));
       if (cDay % 10 != 0 || cDay == 10) {
           tmpry += numString.charAt((cDay - 1) % 10);
       }
       return tmpry;
     },
     getBit:function(m,n){
       return (m >> n) & 1;
     },
     calcWeekDay:function(week){
       return ['周日','周一','周二','周三','周四','周五','周六'][week];
     },
     getDateParams:function(dd){
       return {
         "yy":dd.getFullYear(),
         "mm":("0"+(dd.getMonth()+1)).substr(-2),
         "dd":("0"+dd.getDate()).substr(-2),
         "zz":dd.getDay()
       };
     },
     destroy:function(){
       this.$elem.off("click.slide");
       this.$elem.empty();
     }
   };
})();
