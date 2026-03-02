var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
var alternate_stylesheet_link;

var MAP_ROOT = 'https://web.archive.org/web/20160804071426/http://map.dssrzs.org/';

// get the target of a mouse event <_<
function get_target(event) {
    if (!event)
        // sod you, gates
        event = window.event;
    if (!event)
        return null;

    var target;
    if (event.target)
        target = event.target;
    else if (event.srcElement)
        target = event.srcElement;
    else
        return null;

    if (target.nodeType == 3) // defeat Safari bug
	target = target.parentNode;

    if(event.stopPropagation)
        event.stopPropagation();

    return target;
}

// get the relevant td for a mouse event.
function get_td(target) {
    var td = target;
    while (td && td.tagName.toUpperCase() != 'TD')
        td = td.parentNode;
    return td;
}

function get_selection() {
    var selection = new Array();

    if(document.getElementsByClassName) {
        var nodes = document.getElementsByClassName('high');
        for(var i = 0, end = nodes.length; i < end; i++) {
            var td = get_td(nodes.item(i));
            if(td)
                selection.push(td.id);
        }
    }
    else {
        // sod you, microsoft. really >:
        var a = document.getElementsByTagName('div');
        var i = 0, e;
        while((e = a[i++])) {
            if(e.className && e.className.indexOf('high') != -1) {
                var td = get_td(e);
                if(td)
                    selection.push(td.id);
            }
        }
    }

    return selection;
}

function locid_to_a(locid) {
    return locid.substr(1).split('y');
}

function locid_to_sel(locid) {
    var a = locid_to_a(locid);
    var x = a[0];
    var y = a[1];
    if(x.length == 1)
        x = '0' + x;
    if(y.length == 1)
        y = '0' + y;
    return x+y;
}

function click_handler(event) {
    var target = get_target(event);
    if(!target)
        return false;

    var td = get_td(target);
    if(!td)
        return false;

    var settings = get_settings();

    if(settings.select) {
        var selection = get_selection();
        if(!selection)
            return false;
        // console.log('selection click ' + x + 'x' + y);
        var ps = locid_to_sel(td.id);
        var newsel = new Array();
        for(var i = 0, end = selection.length; i < end; i++) {
            var ps1 = locid_to_sel(selection[i]);
            if(ps != ps1)
                newsel.push(ps1);
        }
        if(newsel.length == selection.length)
            newsel.push(ps);
        if(newsel.length > 0)
            document.location = MAP_ROOT + 'select/'+newsel.join('');
    }
    else {
        var a = locid_to_a(td.id);
        document.location = MAP_ROOT + 'location/'+a[0]+'-'+a[1];
    }

    return false;
}

function install_handlers() {
  var tds = document.getElementsByTagName('td');
  var td, i, end = tds.length;
  for(i = 0; i < end; i += 1) {
    td = tds[i];
    if(td.className.substr(0,3) == 'loc')
      td.onclick = click_handler;
  }
}

// return true if global alternate_stylesheet_link is now valid
function get_alt_stylesheet_link() {
  if(alternate_stylesheet_link)
    return true;
  if(!document.getElementsByTagName)
    return false;

  var links = document.getElementsByTagName('link');
  var i, link, end = links.length;
  for(i = 0; i < end; i += 1) {
    link = links[i];
    if(link.getAttribute('rel') == 'alternate stylesheet') {
      alternate_stylesheet_link = link;
      return true;
    }
  }
  return false;
}

function get_settings() {
    var r = { freerun: false, select: false };
    var cs = document.cookie;
    if(cs) {
        var ca = cs.split(';');
        for(var i = 0; i < ca.length; i++) {
            var ma = ca[i].match(/MAP=[FNS]+/);
            if(ma) {
                cs = ma[0];
                if(cs.substr(4,1) == 'F')
                    r.freerun = true;
                if(cs.substr(5,1) == 'S')
                    r.select = true;
            }
        }
    }

    return r;
}

function save_settings(r) {
    if(!r.freerun && !r.select)
        document.cookie = 'MAP=NN; expires=Thu Jan  1 00:00:00 UTC 1970; path=/';
    else {
        var f = r.freerun ? 'F' : 'N';
        var s = r.select ? 'S' : 'N';
        var date = new Date();
        date.setTime(date.getTime()+(365*24*60*60*1000)); // 1 year from now
        document.cookie = 'MAP=' + f + s + '; expires='+date.toGMTString()+'; path=/';
    }
}

function toggle_style() {
    var settings = get_settings();
    settings.freerun = !(settings.freerun);
    save_settings(settings);
    set_style(settings.freerun);

    var button = document.getElementById('freerun-button');
    if(button) {
        if(settings.freerun)
            button.className = 'pushed';
        else
            button.className = '';
    }

    return false;
}

function set_style(freerun) {
  if(!alternate_stylesheet_link)
    return;

  if(freerun) {
    alternate_stylesheet_link.rel = 'stylesheet';
    alternate_stylesheet_link.disabled = false;
  }
  else {
    alternate_stylesheet_link.rel = 'alternate stylesheet';
    alternate_stylesheet_link.disabled = true;
  }
}

function toggle_select() {
    var settings = get_settings();
    settings.select = !(settings.select);
    save_settings(settings);
    //set_style(settings.freerun);

    var button = document.getElementById('select-button');
    if(button) {
        if(settings.select)
            button.className = 'pushed';
        else
            button.className = '';
    }

    return false;
}

function make_styleswitcher() {

    /* 1. find the map container */

    var tables = document.getElementsByTagName('table');
    var mapc, table, i, end = tables.length;
    for(i = 0; i < end; i += 1) {
        table = tables[i];
        if(table.className.indexOf('map-container') != -1) {
            mapc = table;
            break;
        }
    }

    if(!mapc)
        return;

    if(!get_alt_stylesheet_link())
        return;

    /* 2. insert the switcher */

    var settings = get_settings();

    var div = document.createElement('div');
    div.className = 'modes';
    var a = document.createElement('a');
    a.id = 'freerun-button';
    a.href = '#';
    var text = document.createTextNode("Free-running Lanes");
    a.appendChild(text);
    if(settings.freerun)
        a.className = 'pushed';
    div.appendChild(a);
    a.onclick = toggle_style;

    a = document.createElement('a');
    a.id = 'select-button';
    a.href = '#';
    text = document.createTextNode("Select Mode");
    a.appendChild(text);
    if(settings.select)
        a.className = 'pushed';
    div.appendChild(a);
    a.onclick = toggle_select;

    mapc.parentNode.insertBefore(div, mapc);
}

function initialise() {
  if(!document.getElementsByTagName ||
     !document.createTextNode)
    return;
  make_styleswitcher();
  install_handlers();
}

// now call the above. if the DOM already has the links, it'll do
// it's work. if not, we'll call it again on body load.
if(get_alt_stylesheet_link() && get_settings().freerun)
  set_style(true);

}

/*
     FILE ARCHIVED ON 07:14:26 Aug 04, 2016 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:32:39 Mar 02, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.789
  exclusion.robots: 0.031
  exclusion.robots.policy: 0.015
  esindex: 0.012
  cdx.remote: 28.381
  LoadShardBlock: 140.267 (3)
  PetaboxLoader3.datanode: 170.634 (4)
  load_resource: 880.939
  PetaboxLoader3.resolve: 762.539
*/