import test from 'node:test';
import assert from 'node:assert/strict';
import {SCALES,ROOTS,scaleNotes,notePool,diatonicNote,frequency,staffSVG,musicXML} from '../dist/music.js';
test('les 96 gammes respectent les intervalles et restent dans une octave',()=>{
 for(let root=0;root<ROOTS.length;root++)for(const [type,definition] of Object.entries(SCALES)){
  const notes=scaleNotes(root,type);
  assert.deepEqual(notes.map(n=>n.midi-notes[0].midi),definition.intervals);
  assert.equal(notes.at(-1).midi-notes[0].midi,12);
  assert.ok(notes.every(n=>Math.abs(n.alter)<=2));
 }
});
test('orthographe musicale des tonalités avec dièses et bémols',()=>{
 assert.deepEqual(scaleNotes(6,'major').map(n=>n.name),['Fa♯','Sol♯','La♯','Si','Do♯','Ré♯','Mi♯','Fa♯']);
 assert.deepEqual(scaleNotes(1,'major').map(n=>n.name),['Ré♭','Mi♭','Fa','Sol♭','La♭','Si♭','Do','Ré♭']);
 assert.deepEqual(scaleNotes(0,'blues').map(n=>n.name),['Do','Mi♭','Fa','Sol♭','Sol','Si♭','Do']);
 assert.deepEqual(scaleNotes(2,'dorian').map(n=>n.name),['Ré','Mi','Fa','Sol','La','Si','Do','Ré']);
});
test('les clefs partagent le do central avec la bonne octave',()=>{
 assert.equal(diatonicNote(28).midi,60);
 assert.equal(diatonicNote(18).name,'Sol');assert.equal(diatonicNote(18).midi,43);
 assert.equal(diatonicNote(30).name,'Mi');assert.equal(diatonicNote(30).midi,64);
 assert.equal(diatonicNote(24).name,'Fa');assert.equal(diatonicNote(24).midi,53);
 assert.equal(notePool('treble','beginner').length,9);
 assert.equal(notePool('bass','advanced').length,17);
 assert.equal(frequency(69),440);
});
test('les portées incluent lignes supplémentaires et bécarre après une blue note',()=>{
 const svg=staffSVG(scaleNotes(0,'blues'),{labels:true});
 assert.ok(svg.includes('♮'));assert.ok(svg.includes('Sol♭'));assert.ok(svg.includes('<svg'));
 const central=staffSVG([diatonicNote(28)]);assert.ok(central.includes('y1="120"'));
 const bass=staffSVG([diatonicNote(28)],{clef:'bass'});assert.ok(bass.includes('y1="36"'));
});
test('MusicXML conserve les hauteurs, la clef et les silences de fin de mesure',()=>{
 const xml=musicXML(scaleNotes(0,'blues'),'bass');
 assert.ok(xml.includes('<sign>F</sign><line>4</line>'));
 assert.ok(xml.includes('<step>G</step><alter>-1</alter>'));
 assert.equal((xml.match(/<measure number=/g)||[]).length,2);
 assert.ok(xml.includes('<rest/><duration>1</duration><type>quarter</type>'));
 const fifteen=musicXML([...scaleNotes(0),...scaleNotes(0).slice(0,-1).reverse()]);
 assert.ok(fifteen.includes('<rest/><duration>1</duration>'));
});
test('une gamme inconnue est rejetée',()=>{assert.throws(()=>scaleNotes(20),RangeError);assert.throws(()=>scaleNotes(0,'inconnue'),RangeError);});

