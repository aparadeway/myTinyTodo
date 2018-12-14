(function(){
  var colorMap = ['dark-red','light-red','dark-green','light-green','dark-yellow','light-yellow','dark-aqua','light-aqua'];
  var colors = colorMap.length;
  var inputToDo = document.getElementById('inp-to-do');//输入框
  var list = document.getElementById('list');//列表
  var statusBar = document.getElementById('status');// 状态栏
  var selectAll = document.getElementById('select-all');// 全选按钮
  var selectAllArea = document.querySelector('#inp-area label.check-all');// 全选按钮区域
  var edit = list.querySelector('edit');// 条目编辑框 
  var count = document.getElementById('status').querySelector('.count');// 数量统计
  var order = statusBar.querySelector('.order');// 筛选
  var fil = document.querySelectorAll('ul.order li');//分类查看按钮
  localStorage.todos = localStorage.todos?localStorage.todos:JSON.stringify([]);// 获取数据
  var view = 1;// 查看方式 1全部 2待完成 3已完成
  var clear = document.getElementById('clear-completed');// 清除已完成（按钮）
  var globalData = JSON.parse(localStorage.todos);//从本地存储读取数据

  init();//初始化

  // 初始化
  function init(){
    view = 1;
    showList(globalData,list,1);
    checkCompleted();
  }
  // 分类查看
  order.addEventListener('click',function(e){
    var ele = e.target;
    if(ele === fil[0]){
      init();
    }
    else if(ele === fil[1]){
      view = 2;
      showList(globalData,list,true);
    }
    else if(ele === fil[2]){
      view = 3;
      showList(globalData,list,false);
    }
    setFilterSStyle(ele);
  })
  // 新增项目
  inputToDo.addEventListener('keyup',function(e){
    if(e.keyCode == 13){
      var newData;
      var value = inputToDo.value.trim();
      if(value !== ''){
        addItem(value,list);
        inputToDo.value = '';
      }
    }
  })
  // 新增列表项
  // 参数
  // content:文字内容
  // parentNode:新增列表项所在的父节点
  function addItem(content,parentNode){
    var length = globalData.length;
    var newItem = {
      id:createID(),
      content:content,
      completed:false
    }
    globalData.push(newItem);
    // 插入新项
    if(view !== 3){
      var li = document.createElement('li');
      var lis = parentNode.getElementsByTagName('li');
      li.className = setItemBgcolor(lis.length);
      li.dataset.id = newItem.id;
      li.innerHTML = createItem(newItem.content,false);
      parentNode.appendChild(li);
      statusBar.style.display = 'block';
    }
    updateLocalStorage();
    updateCount();
    toggleCheckAllBtn();
    isAll();
  }
  // 生成列表
  // 参数：
  // data:列表数据
  // parentNode:所要操作的节点
  // filter:1 全部 true 已完成 false 待完成
  function showList(data,parentNode,filter){
    var isActive = true;
    var len = data.length;
    var colorClass;
    var str = '';
    if(filter === 'active'){
      completed = false;
    }
    else if(filter === 'completed'){
      active = false;
    }
    var isCompleted;
    for(var i = 0;i < len;i++){
      if(filter !== 1 && data[i].completed === filter){
        continue;
      }
      isCompleted = data[i].completed;
      str += '<li class="'+ setItemBgcolor(i) +'" data-id="' + data[i].id + '">';
      str += createItem(data[i].content,isCompleted);
      str += '</li>';
    }
    parentNode.innerHTML = str;
    if(len > 0){
      statusBar.style.display = 'block';
    }
    updateCount();
    toggleCheckAllBtn();
    isAll();
  }
  // 设置列表项背景色
  // 参数
  // index:列表项的索引
  function setItemBgcolor(index){
    var colorClass = colorMap[index % colors];
    return colorClass
  }
  // 创建列表项
  // 参数
  // content:列表项的文字内容
  function createItem(content,completed){
    var c = '';
    var checked = '';
    if(completed){
      c = 'style="opacity:0.5;text-decoration:line-through"';
      checked = 'checked="checked"';
    }
    var str = 
      `<span class="check">
        <label class="checked">
          <input type="checkbox" ${checked}">
          <span class="active"></span>
        </label>
      </span>
      <div class="item-content display-block" ${c}>${content}</div>
      <input type="text" class="edit display-none" spellcheck="false">
      <button class="delete"></button>`
    return str
  }
  // 切换选中
  list.addEventListener('click',function(e){
    var ele = e.target;
    var checked = false;
    var textDecoration = '';
    var opacity = 1;
    if(ele.nodeName === 'INPUT' && ele.parentNode.nodeName === 'LABEL'){
      checked = ele.checked;
      while(ele.nodeName !== 'LI'){
        ele = ele.parentNode;
      }
      if(!checked){
        textDecoration = 'none';
        opacity = 1;
      }
      else{
        textDecoration = 'line-through';
        opacity = 0.5
      }
      var text = ele.querySelector('.item-content');
      setTextDecoration(text,opacity,textDecoration);
      changeCompleted(ele.dataset.id,checked);
      // 查看是否为全选
      isAll();
      // 若view为待完成或已完成则移除该节点
      if((view === 2 && checked) || view === 3 && !checked){
        removeNode(list,ele);
      }
      updateCount();
      updateLocalStorage();
      checkCompleted();
    }
  })
  // 查看是否为全选
  function isAll(){
    var checkedAll = true;
    var checklist = list.querySelectorAll('.checked input');
     for(var i = 0;i < checklist.length;i++){
       if(checklist[i].checked == false){
         checkedAll = false;
         break;
       }
     }
     selectAll.checked = checkedAll;
  }
  // 全选
  selectAll.addEventListener('change',function(e){
    var checked = this.checked;
    var decoration;
    var opacity;
    if(checked){
      decoration = 'line-through';
      opacity = 0.5;
    }
    else{
      decoration = 'none';
      opacity = 1;
    }
    var lis = list.querySelectorAll('li');
    var checkList = list.querySelectorAll('.checked input');
    var textList = list.querySelectorAll('li .item-content');
    for(var i = 0;i < checkList.length;i++){
      checkList[i].checked = checked;
    }
    for(var j = 0;j < textList.length;j++){
      setTextDecoration(textList[j],opacity,decoration);
    }
    for(var k = 0;k < globalData.length;k++){
      globalData[k].completed = checked;
    }
    if(view === 2){
      if(checked){
        list.innerHTML = '';
      }
      else{
        fil[1].click();
      }
    }
    else if(view === 3)
      if(!checked){
        list.innerHTML = '';
      }
      else{
        fil[2].click();
      }
    updateCount();
    checkCompleted();
  })
  // 双击编辑
  list.addEventListener('dblclick',function(e){
    if(e.target.nodeName === 'DIV'){
      var div = e.target;
      var li = div.parentNode;
      var edit = div.nextElementSibling;
      edit.style.display = 'block';
      div.style.display = 'none';
      edit.value = div.innerText.trim();
      edit.focus();
      edit.addEventListener('blur',Edit);
      edit.addEventListener('keyup',function(e){
        if(e.keyCode == 13){
          Edit(e);
        }
      })
      function Edit(e){
        div.style.display = 'block';
        edit.style.display = 'none';
        div.innerText = edit.value;
        // 更新数据
        for(var i = 0;i < globalData.length;i++){
          if(globalData[i].id === li.dataset.id){
            globalData[i].content = edit.value;
            break;
          }
        }
        updateLocalStorage();
        edit.removeEventListener('blur',Edit);
      }
    }
  })
  // 删除条目
  list.addEventListener('click',function(e){
    var ele = e.target;
    if(ele.nodeName === 'BUTTON'){
      while(ele.nodeName !== 'LI'){
        ele = ele.parentNode;
      }
      deleteItem(ele,ele.dataset.id);
    }
  })
  // 设置文字样式
  // 参数
  // node:所要操作的节点
  // opacity:所要设置的文字透明度
  // decoration:所要设置的文字装饰
  function setTextDecoration(node,opacity,decoration){
    node.style.opacity = opacity;
    node.style.textDecoration = decoration;
  }
  // 删除条目
  // 参数
  // node:所要删除的节点
  // id:所要删除的数据的id
  function deleteItem(node,id){
    for(var i = 0;i < globalData.length;i++){
      if(globalData[i].id === id){
        globalData.splice(i,1);
        break;
      }
    }
    list.removeChild(node);
    toggleCheckAllBtn();
    updateLocalStorage();
    // 若无数据则隐藏状态栏
    if(globalData.length === 0){
      statusBar.style.display = 'none';
    }
  }
  // 更新待完成条目数量
  function updateCount(){
    var left = 0;
    for(var i = 0;i < globalData.length;i++){
      if(globalData[i].completed === false){
        left++;
      }
    }
    if(left < 2){
      count.innerText = left + ' item left';
    }
    else{
      count.innerText = left + ' items left';
    }
  }
  // 更改完成状态
  // 参数
  // id:所要更新状态的数据id
  // completed:完成状态
  function changeCompleted(id,completed){
    for(var i = 0;i < globalData.length;i++){
      if(globalData[i].id === id){
        globalData[i].completed = completed;
        break;
      }
    }
    updateLocalStorage();
    updateCount();
  }
  // 检查是否有已完成的条目
  function checkCompleted(){
    var hasCompleted = false;
    var visibility;
    var zIndex;
    for(var i = 0;i < globalData.length;i++){
      if(globalData[i].completed === true){
        hasCompleted = true;
        break;
      }
    }
    // 若有已完成则显示相关按钮，反之隐藏
    if(hasCompleted){
      addClass(clear,'showElement');
    }
    else{
      removeClass(clear,'showElement');
    }
  }
  // 清除已完成
  clear.addEventListener('click',clearCompleted);
  function clearCompleted(){
    for(var i = 0;i < globalData.length;i++){
      if(globalData[i].completed === true){
        globalData[i] = null;
      }
    }
    globalData = condenseAry(globalData);
    updateLocalStorage();
    // 若view为3则直接清空
    if(view === 3){
      list.innerHTML = '';
    }
    else if(view === 1){
      var lis = list.querySelectorAll('li');
      for(var i = lis.length - 1;i >= 0;i--){
        if(lis[i].querySelector('.check input').checked === true){
          list.removeChild(lis[i]);
        }
      }
    }
    // 清空后若无数据则隐藏状态栏
    if(globalData.length === 0){
      statusBar.style.display = 'none';
    }
    toggleCheckAllBtn();
  } 
  // 隐藏或显示全选按钮
  function toggleCheckAllBtn(){
    if(globalData.length === 0){
      removeClass(selectAllArea,'showElement');
      fil[0].click();
    }
    else{
      addClass(selectAllArea,'showElement');
    }
  }
  // 更新全局数据（列表数据）
  function updateGlobal(){
    globalData = JSON.parse(localStorage.todos);
  }
  // 更新本地存储
  function updateLocalStorage(){
    localStorage.todos = JSON.stringify(globalData);
  }
  // 生成ID
  function createID(){
    return (function genID(length){
      return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
    })(10)
  }
  // 移除节点
  // 参数：
  // parentNode:所要移除的节点所在的父节点
  // node:所要移除的节点
  function removeNode(parentNode,node){
    list.removeChild(node);
  }
  // 设置当前选中分类的样式
  // 参数：
  // node:需要设置样式的节点
  function setFilterSStyle(node){
    var filters = order.querySelectorAll('li');
    for(var i = 0;i < filters.length;i++){
      removeClass(filters[i],'selected');
    }
    addClass(node,'selected');
  }
  // 添加class
  // 参数：
  // node:需要添加class的节点
  // className:要添加的class的名称
  function addClass(node,className){
    if(node.className.indexOf(className) === -1){
      node.className += ' ' + className;
    }
  }
  // 移除class
  // 参数：
  // node:需要移除class的节点
  // className:要移除的class的名称
  function removeClass(node,className){
    if(node.className.indexOf(className) !== -1){
      node.className = node.className.replace(className,'');
    }
  }
  // 切换class
  // 参数：
  // node:需要切换class的节点
  // oldClass:被替换的class的名称
  // newClass:新class的名称
  function toggleClass(node,oldClass,newClass){
    removeClass(node,oldClass);
    addClass(node,newClass);
  }
  // 压缩稀疏数组
  // 参数：
  // ary:所要被压缩的数字
  function condenseAry(ary){
    return ary.filter(function(item,index){
      return (typeof item !== 'undefined' && item !== null)
    })
  }
})(document)