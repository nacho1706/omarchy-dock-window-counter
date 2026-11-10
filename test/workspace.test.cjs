const { test } = require('node:test');
const assert = require('node:assert/strict');
const { workspaceCount } = require('../Model.js');
const make = (ws, tags=[], appId='foot', child=false) => ({ workspace:{id:ws,name:ws===-98?'special:minimized':ws<0?'special:scratchpad':String(ws)},wayland:{appId,parent:child?{}:null},lastIpcObject:{tags} });
const count = (windows,ws,key='foot') => workspaceCount(windows,key,ws,() => null);
test('Omarchy agent terminals count with the selected terminal app',()=>{
  const { canonicalAppId } = require('../Model.js');
  const resolve = id => ({ id: canonicalAppId(id, 'foot') });
  assert.equal(workspaceCount([make(5),make(5,[],'org.omarchy.agent')],'foot',5,resolve),2);
  assert.equal(workspaceCount([make(5),make(4,[],'org.omarchy.agent')],'foot',5,resolve),1);
  assert.equal(canonicalAppId('firefox','foot'),'firefox');
  assert.equal(canonicalAppId('org.omarchy.nvim','foot'),'org.omarchy.nvim');
});
test('counts duplicate app windows on this workspace only',()=>{
  const windows=[make(1),make(1),make(2),make(11),make(1,[],'firefox'),make(1,[],'foot',true)];
  assert.equal(count(windows,1),2); assert.equal(count(windows,2),1); assert.equal(count(windows,11),1); assert.equal(count(windows,3),0);
});
test('stock minimized windows count on their origin workspace only',()=>{
  const windows=[make(-98,['omarchy-minimized-from-1']),make(-98,['omarchy-minimized-from-2']),make(-98),make(-3,['omarchy-minimized-from-1'])];
  assert.equal(count(windows,1),1);assert.equal(count(windows,2),1);assert.equal(count(windows,3),0);
});
test('invalid minimized origin IDs are ignored',()=>{
  assert.equal(count([make(-98,['omarchy-minimized-from-x']),make(-98,['omarchy-minimized-from-0'])],1),0);
});
test('desktop entry aliases group under their canonical application',()=>{
  assert.equal(workspaceCount([make(1,[],'Foot')],'org.codeberg.dnkl.foot',1,()=>({id:'org.codeberg.dnkl.foot'})),1);
});
test('window moves and closures immediately change the count',()=>{
  const window=make(1);assert.equal(count([window],1),1);window.workspace.id=2;assert.equal(count([window],1),0);assert.equal(count([window],2),1);assert.equal(count([],2),0);
});

test('overlay text is plain and its input region stays empty',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const qml=fs.readFileSync(path.join(__dirname,'../CounterWindow.qml'),'utf8');
  assert.equal((qml.match(/Text \{/g)||[]).length,(qml.match(/textFormat: Text.PlainText/g)||[]).length);
  assert.ok(qml.includes('mask: Region {}'));
  assert.ok(!qml.includes('MouseArea'));
});

test('generic saved-workspace metadata is read without depending on another project',()=>{
  assert.equal(count([make(-98,['example-workspace-5'])],5),1);
  assert.equal(count([make(-98,['example-workspace-5'])],4),0);
});

test('app identifiers cannot collide with object prototype keys',()=>{
  const { buildItems } = require('../Model.js');
  const items=buildItems(['__proto__'],[{key:'__proto__',hasEntry:true,workspaceId:1}]);
  assert.equal(items.length,1);assert.equal(items[0].windows.length,1);
});
