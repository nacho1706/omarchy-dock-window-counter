const { test } = require('node:test');
const assert = require('node:assert/strict');
const { workspaceCount } = require('../dock/DockModel.js');
const make = (ws, tags=[], appId='foot', child=false) => ({ workspace:{id:ws,name:ws===-98?'special:minimized':ws<0?'special:scratchpad':String(ws)},wayland:{appId,parent:child?{}:null},lastIpcObject:{tags} });
const count = (windows,ws,key='foot') => workspaceCount(windows,key,ws,() => null);
test('Omarchy agent terminals count with the selected terminal app',()=>{
  const { canonicalAppId } = require('../dock/DockModel.js');
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
test('stock and Genie minimized origins remain local',()=>{
  const windows=[make(-98,['omarchy-minimized-from-1']),make(-98,['genie-workspace-2']),make(-98),make(-3,['genie-workspace-1'])];
  assert.equal(count(windows,1),1);assert.equal(count(windows,2),1);assert.equal(count(windows,3),0);
});
test('Genie origin wins over stale stock tags and invalid IDs are ignored',()=>{
  const windows=[make(-98,['omarchy-minimized-from-1','genie-workspace-2']),make(-98,['genie-workspace-x'])];
  assert.equal(count(windows,1),0);assert.equal(count(windows,2),1);assert.equal(count(windows,-1),0);
});
test('desktop entry aliases group under their canonical application',()=>{
  assert.equal(workspaceCount([make(1,[],'Foot')],'org.codeberg.dnkl.foot',1,()=>({id:'org.codeberg.dnkl.foot'})),1);
});
test('window moves and closures immediately change the count',()=>{
  const window=make(1);assert.equal(count([window],1),1);window.workspace.id=2;assert.equal(count([window],1),0);assert.equal(count([window],2),1);assert.equal(count([],2),0);
});

test('all dock display text sinks explicitly render plain text',()=>{
  const fs=require('node:fs'),path=require('node:path');
  for(const file of ['DockWindow.qml','AppGrid.qml']) {
    const qml=fs.readFileSync(path.join(__dirname,'../dock',file),'utf8');
    assert.equal((qml.match(/Text \{/g)||[]).length,(qml.match(/textFormat: Text.PlainText/g)||[]).length);
    assert.ok(!qml.includes('showTooltip('));
  }
});
