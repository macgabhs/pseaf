/* AWN PSEAF Field App - app.js (version 1.4, built from Project Administration Portal 4.7) */
'use strict';
const APP_VERSION = '1.4';
function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
/* =====================================================================
   PSEAF (Project Safety & Environmental Assessment Form) - EHS-P-001-F1
   Integrated into the Convert-to-Project flow and available standalone.
   Sections are generated from the arrays below and injected into a host
   container, so the same code serves both the Convert view (prefix "cv")
   and the standalone view (prefix "ps").
   ===================================================================== */

/* ---- Reference data (verbatim from EHS-P-001-F1) ---- */
const PSEAF_KIT = ["PPE (Boots, Hi-Viz, Glasses)","Mobile Phone (Charged)","First Aid Kit","Life Jacket","Suitable Clothing","Safe Pass Card","Gloves","Copy of this form (PSEAF)"];
const PSEAF_LONE_NO = ["Are you fit to work alone?","Is your mobile phone with your person, charged and switched on?","Does your team know you are working alone and where you are?","Has the StaySafe App session been initiated and an Out-of-Hours escalation contact confirmed?"];
const PSEAF_LONE_YES = ["Does the workplace present a special risk to a lone worker? (e.g. chemicals, violence, heavy lifting, inexperience)"];
const PSEAF_LONE_NIGHT = ["Is the lone working assessment being carried out at night time?"];
const PSEAF_SUB_NOTICE = "All subcontractors are subject to AWN policies regarding the collection of a site specific Risk Assessment and Method Statement (RAMS), confirmation of insurance and safety statement.";
const PSEAF_STANDARD_CONTACTS = [
  ["Emergency (Gardai, Ambulance, Fire)","999 or 112"],
  ["Gas Networks Ireland","1850 20 50 50"],
  ["ESB Networks","1850 372 999"],
  ["EPA Incident Hotline (environment)","1890 33 55 999"]
];
const PSEAF_POW_TEXT = "I confirm I am on-site, I have visually assessed the physical site conditions today, and they match the desktop assessment outlined in the site specific risk assessment of this form, with no new or unexpected hazards present.";
const PSEAF_SUB_VERIFY_TEXT = "I confirm, as the Project Manager or Lead Consultant on site, that each subcontractor's RAMS and insurance have been reviewed and approved before work commences.";
const PSEAF_AE_SYNC = {};
const PSEAF_DECLARATION = [
  "I am appropriately qualified and suitably experienced to perform these tasks.",
  "I have received appropriate training and guidance as part of my company's own systems to enable me to complete these tasks in a safe manner.",
  "I have received, read and understand the Safety Procedures and Risk Assessments associated with this Project, and the associated site specific risks and mitigations.",
  "In the event of new risks being identified as work progresses, it is my responsibility to ensure the site supervisor or Project Manager is aware and to stop work if necessary so that risk assessments, control measures and this form are updated appropriately.",
  "It is my responsibility to ensure that I, and anyone working under my supervision, follow the Safety Procedures and Risk Assessments and use the safety equipment provided."
];


/* =====================================================================
   SITE SPECIFIC RISK ASSESSMENT - ACTIVITY PRESETS
   Each activity maps to a set of hazard entries. Selecting more than one
   activity merges the entries and de-duplicates any hazard they share,
   so a common hazard such as driving for work is only ever listed once.
   Entries are emitted in PSEAF_HAZARD_ORDER so the text always reads in
   a sensible sequence regardless of the order activities were ticked.
   ===================================================================== */

/* Hazard library: id -> { label, text }.
   The label is used as the de-duplication key and is written as the
   opening of each paragraph, e.g. "Driving for work: ...". */
const PSEAF_HAZARDS = {
  access: {
    label: 'Site access and induction',
    text: 'confirm access in advance, report to the site office and complete the site induction. Follow EHS-P-002.'
  },
  driving: {
    label: 'Driving for work',
    text: 'plan the route, drive to the conditions, take breaks on long journeys and do not use a phone at the wheel. Follow EHS-P-004.'
  },
  lone: {
    label: 'Lone working',
    text: 'tell the office your location and expected duration, keep a charged phone on you and check in on leaving. Follow EHS-P-003.'
  },
  uneven: {
    label: 'Uneven ground, slips and trips',
    text: 'wear safety boots with good grip, plan access routes and use a torch in poor light.'
  },
  weather: {
    label: 'Adverse weather',
    text: 'check the forecast, carry suitable protective clothing and postpone the visit if conditions become unsafe. Follow EHS-P-006.'
  },
  manual: {
    label: 'Manual handling',
    text: 'use a trolley or two-person lift for heavy or awkward items, keep loads close and avoid twisting. Follow EHS-P-005.'
  },
  traffic: {
    label: 'Site traffic and mobile plant',
    text: 'wear high-visibility clothing and a hard hat, use pedestrian routes and make eye contact with operators before approaching.'
  },
  roadside: {
    label: 'Working near live carriageways',
    text: 'stand well back from the running lane facing oncoming traffic, wear high-visibility clothing and do not work on the carriageway without traffic management.'
  },
  public: {
    label: 'Public interaction and antisocial behaviour',
    text: 'stay aware of your surroundings, avoid confrontation, keep valuables out of sight and withdraw if you feel unsafe.'
  },
  livestock: {
    label: 'Livestock and farm animals',
    text: 'confirm access with the landowner, keep to field boundaries, close gates and do not enter fields with a bull or cattle with calves.'
  },
  ticks: {
    label: 'Ticks and Lyme disease',
    text: 'cover exposed skin, use insect repellent, check for ticks after the survey and seek medical advice if a rash develops.'
  },
  height: {
    label: 'Working at height',
    text: 'use fixed access and edge protection where available, maintain three points of contact on ladders and do not overreach. Follow EHS-P-011.'
  },
  electrical: {
    label: 'Electrical hazards',
    text: 'inspect leads before use, use RCD-protected supplies, keep equipment clear of water and route cables away from walkways.'
  },
  noise: {
    label: 'High noise levels',
    text: 'wear hearing protection above 85 dB(A), limit time near the source and warn others before starting any test signal.'
  },
  dust: {
    label: 'Dust, fumes and emissions',
    text: 'work upwind where possible and wear respiratory protection if required by the task or the site.'
  },
  water: {
    label: 'Working in or near water',
    text: 'sample from a stable bank using a pole, wear a life jacket where there is a risk of immersion and never work alone at the water\u2019s edge. Follow EHS-P-007.'
  },
  weils: {
    label: 'Weil\u2019s disease and biological hazards',
    text: 'wear gloves, cover cuts with waterproof dressings, do not eat or drink while working and wash hands before breaks.'
  },
  confined: {
    label: 'Confined spaces',
    text: 'do not enter. Sample or inspect from the surface and refer any need for entry to the Project Manager.'
  },
  chemicals: {
    label: 'Sample preservatives',
    text: 'keep bottles upright and separated, wear gloves and eye protection when filling, and carry a spill kit and eyewash. Follow EHS-P-010.'
  },
  sharps: {
    label: 'Contaminated material and sharps',
    text: 'wear gloves and safety boots, do not handle waste by hand, do not disturb suspected asbestos and report any suspect material.'
  },
  services: {
    label: 'Buried and overhead services',
    text: 'review service drawings, complete a CAT and Genny scan before breaking ground and keep clear of overhead lines.'
  },
  rotating: {
    label: 'Drilling plant and rotating machinery',
    text: 'stay outside the exclusion zone while the rig operates, wear close-fitting clothing and agree an emergency stop signal with the driller. Follow EHS-P-008.'
  },
  equipment: {
    label: 'Unattended equipment',
    text: 'secure equipment away from public access, label it with AWN contact details and keep cables clear of walkways.'
  }
};

/* Canonical output order so the assessment always reads logically. */
const PSEAF_HAZARD_ORDER = [
  'access','driving','lone','uneven','weather','manual','traffic','roadside',
  'public','livestock','ticks','height','electrical','noise','dust','water',
  'weils','confined','chemicals','sharps','services','rotating','equipment'
];

/* The activities offered, each mapped to its typical hazards. */
const PSEAF_ACTIVITIES = [
  { id:'noise',    name:'Noise Survey',
    hazards:['access','driving','lone','uneven','weather','manual','roadside','public','noise','equipment'] },
  { id:'air',      name:'Air Monitoring',
    hazards:['access','driving','lone','uneven','weather','manual','traffic','height','electrical','dust','equipment'] },
  { id:'acoustic', name:'Acoustic Testing',
    hazards:['access','driving','uneven','manual','traffic','height','electrical','noise','dust'] },
  { id:'inspect',  name:'Site Inspections',
    hazards:['access','driving','lone','uneven','weather','traffic','public','livestock','sharps'] },
  { id:'ecology',  name:'Ecology Field Survey',
    hazards:['access','driving','lone','uneven','weather','public','livestock','ticks','water','weils'] },
  { id:'water',    name:'Water Sampling',
    hazards:['access','driving','lone','uneven','weather','manual','livestock','water','weils','confined','chemicals'] },
  { id:'drilling', name:'Drilling Supervision',
    hazards:['access','driving','uneven','weather','manual','traffic','noise','dust','sharps','services','rotating'] }
];

/* Merge the hazards for a set of activity ids, de-duplicated and ordered. */
function pseafHazardIdsFor(activityIds){
  const set = {};
  activityIds.forEach(function(aid){
    const act = PSEAF_ACTIVITIES.filter(function(a){ return a.id === aid; })[0];
    if(!act){ return; }
    act.hazards.forEach(function(h){ set[h] = true; });
  });
  return PSEAF_HAZARD_ORDER.filter(function(h){ return set[h]; });
}

/* Build the assessment text for a set of activity ids. */
function pseafHazardText(activityIds){
  return pseafHazardIdsFor(activityIds).map(function(h){
    const z = PSEAF_HAZARDS[h];
    return z.label + ': ' + z.text;
  }).join('\n\n');
}

/* ---- Section builder -------------------------------------------------
   startNum = the step number this PSEAF block begins at, so the numbered
   circles continue seamlessly from the host form's existing sections.
   includeProjectFields = true for the standalone view (which has no
   Convert fields to reuse); false inside Convert, where Company, Project
   Manager, Desktop study and Project folder already exist and must NOT
   be duplicated.
   -------------------------------------------------------------------- */
const PSEAF_SIG_HOOKS = {};
const PSEAF_REVEAL_SYNC = {};
const PSEAF_OPTS = {};
const PSEAF_ADD_ROW = {};
const PSEAF_RENUMBER = {};
/* opts:
     skipKit         - omit the Essential kit checklist
     skipLone        - omit the Lone working assessment
     minimalContacts - Project Manager number only (office stays pre-filled)
   Anything omitted here is completed by the field engineer before the
   site visit, using the standalone Update a PSEAF form. */
function buildPseafSections(host, p, startNum, includeProjectFields, opts){
  opts = opts || {};
  PSEAF_OPTS[p] = opts;
  function onSigChange(){ if(typeof PSEAF_SIG_HOOKS[p] === 'function'){ PSEAF_SIG_HOOKS[p](); } }
  let n = startNum;
  let html = '';

  html += '<div class="pseaf-band">'
        + '<strong>Project Safety &amp; Environmental Assessment Form (PSEAF)</strong>'
        + '<span>EHS-P-001-F1 &nbsp;|&nbsp; Completing the form creates one PSEAF file to share or save to the project folder. It can be reopened to complete further assessments.</span>'
        + (opts.siteWorkGate
            ? '<span class="pseaf-band-note">If you are not the person attending site, the essential kit checklist and lone working assessment are completed by the field engineer nearer the site visit, using the PSEAF file saved in the project folder.</span>'
            : '')
        + '</div>';

  /* ---- Site work gate ------------------------------------------------
     Asked first, because the answer decides how much of the rest of the
     form applies. gate() is hoisted, so calling it here is safe. ----- */
  if(opts.siteWorkGate){
    html += '<section class="card">'
      + '<h2><span class="num">'+(n++)+'</span>Who is attending site?</h2>'
      + '<p class="hint">Answer this first: it decides whether you complete the essential kit checklist, the lone working assessment and the full site contacts here, or leave them for the field engineer.</p>'
      + gate('SiteWork','Will you also be carrying out the site work?','Answer No if another member of staff will attend site.')
      + '</section>';
  }

  if(includeProjectFields){
    html += '<section class="card">'
      + '<h2><span class="num">'+(n)+'</span>Project details</h2>'
      + '<p class="hint">The project this assessment relates to, and who is completing it.</p>'
      + '<div class="grid">'
      + '<div class="field"><label for="'+p+'ProjNo">Project number<span class="req">*</span></label><input type="text" id="'+p+'ProjNo" placeholder="e.g. R267501.1234"></div>'
      + '<div class="field"><label for="'+p+'Pm">Your name<span class="req">*</span></label><input type="text" id="'+p+'Pm" placeholder="Your full name" autocomplete="name"></div>'
      + '</div></section>';
    n++;
  }

  /* Site details (never duplicated - Convert has no site fields) */
  html += '<section class="card">'
    + '<h2><span class="num">'+(n++)+'</span>Site details</h2>'
    + '<p class="hint">Where the work takes place and when the assessment was carried out.</p>'
    + '<div class="grid">'
    + '<div class="field full"><label for="'+p+'Desc">Project description<span class="req">*</span></label><input type="text" id="'+p+'Desc" placeholder="Short description of the works"></div>'
    + '<div class="field full"><label for="'+p+'Site">Site location<span class="req">*</span></label><input type="text" id="'+p+'Site" placeholder="Site address / location">'
    +   '<button type="button" class="pwa-gps" id="'+p+'GpsBtn"><span aria-hidden="true">&#128205;</span> Use my current location</button>'
    +   '<div class="pwa-gps-msg" id="'+p+'GpsMsg" aria-live="polite"></div></div>'
    + '<div class="field"><label for="'+p+'Date">Assessment date<span class="req">*</span></label><input type="date" id="'+p+'Date"></div>'
    + '</div>'
    + '</section>';

  /* Site specific risk assessment. Selecting activities pre-fills the text
     with the typical hazards and controls for each; the text stays editable. */
  let actRows = '';
  PSEAF_ACTIVITIES.forEach(function(a){
    actRows += '<div class="pseaf-chk"><input type="checkbox" id="'+p+'act_'+a.id+'" data-act="'+a.id+'"><label for="'+p+'act_'+a.id+'">'+escapeHtml(a.name)+'</label></div>';
  });
  html += '<section class="card pseaf-site">'
    + '<h2><span class="num">'+(n++)+'</span>Site specific risk assessment</h2>'
    + '<p class="hint">Tick the activities involved and a concise set of hazards and controls is added below. Shared hazards are only listed once. Edit the text freely to suit the project.</p>'
    + '<h4 class="pseaf-sub">Activities on this project</h4>'
    + '<div class="pseaf-chk-grid" id="'+p+'ActGrid">'+actRows+'</div>'
    + '<div class="pseaf-req-msg" id="'+p+'ActMsg"></div>'
    + '<div class="field" style="margin-top:14px;"><label for="'+p+'SiteRA">Site specific risk assessment<span class="req">*</span></label>'
    + '<textarea id="'+p+'SiteRA" rows="12" placeholder="Tick one or more activities above to insert suggested hazards and controls, or type your own site specific risk assessment here."></textarea>'
    + '<div class="pseaf-req-msg" id="'+p+'SiteRAMsg"></div></div>'
    + '<div class="grid" style="margin-top:16px;">'
    + '<div class="field"><label for="'+p+'SpecProc">Project specific procedures (if required)</label><input type="text" id="'+p+'SpecProc"></div>'
    + '<div class="field"><label for="'+p+'SpecRA">Project specific risk assessment (if required)</label><input type="text" id="'+p+'SpecRA"></div>'
    + '</div></section>';

  /* Reusable Yes/No gate used to reveal a conditional block */
  function gate(key, question, hint){
    /* Deliberately no default: the user must answer explicitly. */
    return '<div class="pseaf-gate unanswered" id="'+p+key+'Gate">'
      + '<span class="pseaf-gate-q">'+escapeHtml(question)+'<span class="req">*</span>'+(hint?'<em>'+escapeHtml(hint)+'</em>':'')+'</span>'
      + '<div class="pseaf-yn-opts">'
      +   '<label><input type="radio" name="'+p+key+'" value="Yes"> Yes</label>'
      +   '<label><input type="radio" name="'+p+key+'" value="No"> No</label>'
      + '</div></div>'
      + '<div class="pseaf-req-msg" id="'+p+key+'Msg"></div>';
  }

  /* Subcontractors - a simple Yes/No; answering Yes shows the AWN policy notice */
  html += '<section class="card pseaf-site">'
    + '<h2><span class="num">'+(n++)+'</span>Subcontractors</h2>'
    + '<p class="hint">Confirm whether a subcontractor is being used on this project.</p>'
    + gate('SubUsed','Is a subcontractor being used on this project?')
    + '<div class="pseaf-reveal" id="'+p+'SubBlock">'
    +   '<div class="pseaf-info">' + escapeHtml(PSEAF_SUB_NOTICE) + '</div>'
    +   '<h4 class="pseaf-sub" style="margin-top:16px;">Subcontractor details<span class="req">*</span></h4>'
    +   '<p class="hint" style="margin-left:0;">Record the name and contact number for each subcontractor. Subcontractors do not sign this form; their own RAMS, insurance and safety statement are collected separately.</p>'
    +   '<div id="'+p+'SubRows"></div>'
    +   '<div class="pseaf-req-msg" id="'+p+'SubMsg"></div>'
    +   '<button type="button" class="btn-ghost" id="'+p+'AddSub">+ Add subcontractor</button>'
    +   '<div class="pseaf-verify">'
    +     '<h4 class="pseaf-sub" style="margin-top:0;">Subcontractor document verification' + (opts.siteWorkGate ? '' : '<span class="req">*</span>') + '</h4>'
    +     (opts.siteWorkGate
            ? '<p class="hint" style="margin-left:0;">If the RAMS and insurance have not yet been received, leave this unticked. The completed PSEAF will state that work must not commence until it is confirmed in the PSEAF file.</p>'
            : '')
    +     '<div class="pseaf-chk"><input type="checkbox" id="'+p+'SubVerify"><label for="'+p+'SubVerify">'+escapeHtml(PSEAF_SUB_VERIFY_TEXT)+'</label></div>'
    +     '<div class="grid">'
    +       '<div class="field"><label for="'+p+'SubVerifyBy">Verified by (PM or Lead Consultant)</label><input type="text" id="'+p+'SubVerifyBy" placeholder="Name"></div>'
    +       '<div class="field"><label for="'+p+'SubVerifyDate">Date verified</label><input type="date" id="'+p+'SubVerifyDate"></div>'
    +     '</div>'
    +     '<div class="pseaf-req-msg" id="'+p+'SubVerifyMsg"></div>'
    +   '</div>'
    + '</div>'
    + '</section>';

  /* Kit and lone working sit inside one block so the site work gate can
     reveal or hide them together. Outside Convert the block is always open. */
  html += '<div class="pseaf-reveal' + (opts.siteWorkGate ? '' : ' open') + '" id="'+p+'SiteWorkBlock">';

  /* Essential kit */
  {
    let kitRows = '';
    PSEAF_KIT.forEach(function(k,i){
      kitRows += '<div class="pseaf-chk"><input type="checkbox" id="'+p+'kit_'+i+'"><label for="'+p+'kit_'+i+'">'+escapeHtml(k)+'</label></div>';
    });
    html += '<section class="card pseaf-site">'
      + '<h2><span class="num"></span>Essential kit checklist</h2>'
      + '<p class="hint">Tick the kit appropriate to the task being carried out.</p>'
      + '<div class="pseaf-chk-grid">'+kitRows+'</div>'
      + '<div class="field" style="margin-top:16px;"><label for="'+p+'KitOther">Additional kit or equipment (if required)</label>'
      + '<textarea id="'+p+'KitOther" rows="2" placeholder="e.g. sound level meter and calibrator, gas detector, ladder, water sampling kit"></textarea></div>'
      + '</section>';
  }

  /* Lone working - the whole assessment only appears if lone working applies */
  /* Yes/No only, and nothing pre-selected: once lone working is confirmed
     every question must be answered deliberately. */
  function yn(arr, key, noteHtml){
    let out = '<div class="pseaf-note">'+noteHtml+'</div>';
    arr.forEach(function(q,i){
      out += '<div class="pseaf-yn unanswered" data-lone-q="'+key+'_'+i+'">'
        + '<span>'+escapeHtml(q)+'<span class="req">*</span></span>'
        + '<div class="pseaf-yn-opts">'
        +   '<label><input type="radio" name="'+p+key+'_'+i+'" value="Yes"> Yes</label>'
        +   '<label><input type="radio" name="'+p+key+'_'+i+'" value="No"> No</label>'
        + '</div></div>';
    });
    return out;
  }
  html += '<section class="card pseaf-site">'
    + '<h2><span class="num"></span>Lone working assessment</h2>'
    + '<p class="hint">Confirm whether any part of this work involves a person working alone.</p>'
    + gate('LoneUsed','Is lone working required on this project?')
    + '<div class="pseaf-reveal" id="'+p+'LoneBlock">'
    +   yn(PSEAF_LONE_NO,'ln','If you answer <b>NO</b> to any of the below, <b>DO NOT</b> continue with the site visit.')
    +   yn(PSEAF_LONE_YES,'ly','If you answer <b>YES</b> to the below, <b>DO NOT</b> continue with the site visit.')
    +   yn(PSEAF_LONE_NIGHT,'lnt','If you answer <b>YES</b> to the below, do not continue as a lone worker unless a site specific risk assessment permits it.')
    +   '<div class="pseaf-req-msg" id="'+p+'LoneQMsg"></div>'
    +   '<div class="pseaf-reveal pseaf-nested" id="'+p+'NightBlock">'
    +     '<div class="field"><label for="'+p+'NightJust">Site specific risk assessment justification for night-time lone working<span class="req">*</span></label>'
    +     '<textarea id="'+p+'NightJust" rows="3" placeholder="No anti social behaviour expected at the site, access by car has been confirmed, no rough terrain expected"></textarea>'
    +     '<div class="pseaf-req-msg" id="'+p+'NightMsg"></div></div>'
    +   '</div>'
    + '</div>'
    + '</section>';

  html += '</div>';   /* close the site work block */

  /* Contacts, declaration and sign-off */
  let declLi = '';
  PSEAF_DECLARATION.forEach(function(t){ declLi += '<li>'+escapeHtml(t)+'</li>'; });
  let stdRows = '';
  PSEAF_STANDARD_CONTACTS.forEach(function(c){
    stdRows += '<tr><td>'+escapeHtml(c[0])+'</td><td>'+escapeHtml(c[1])+'</td></tr>';
  });
  html += '<section class="card">'
    + '<h2><span class="num">'+(n++)+'</span>Key contacts, declaration &amp; sign-off</h2>'
    /* The emergency, next of kin and client contacts are only deferred to
       the field engineer when someone else is attending site. If this
       person is doing the site work, they complete them here, so the
       block is revealed by the site work gate above. */
    + '<p class="hint" id="'+p+'ContactsHint">'
    +   (opts.minimalContacts
          ? 'The office number is included automatically. Staff numbers are recorded at the sign-off below.'
          : 'Record the site contact numbers below. Individual staff numbers are recorded at the sign-off further down.')
    + '</p>'
    + '<div class="grid">'
    + '<div class="field"><label for="'+p+'cOffice">Office contact'
    +   (opts.minimalContacts ? '' : '<span class="req">*</span>')
    +   '</label><input type="tel" id="'+p+'cOffice" value="018474220" placeholder="Phone number"></div>'
    + '</div>'
    + '<div class="pseaf-reveal' + (opts.minimalContacts ? '' : ' open') + '" id="'+p+'ContactsBlock">'
    +   '<div class="grid" style="margin-top:14px;">'
    +   '<div class="field"><label for="'+p+'cEmerg">Emergency contact / next of kin<span class="req">*</span></label><input type="text" id="'+p+'cEmerg" placeholder="Name / number"></div>'
    +   '<div class="field"><label for="'+p+'cClient">Client representative (or N/A)<span class="req">*</span></label><input type="text" id="'+p+'cClient" placeholder="Name / number or N/A"></div>'
    +   '<div class="field"><label for="'+p+'cLocal">Local site emergency contact (or N/A)<span class="req">*</span></label><input type="text" id="'+p+'cLocal" placeholder="e.g. site manager / security, name and number"></div>'
    +   '</div>'
    + '</div>'
    + '<div class="pseaf-std"><b>Standard numbers included automatically on the completed PSEAF</b>'
    + '<table class="pseaf-std-table">'+stdRows+'</table></div>'
    + '<h4 class="pseaf-sub" style="margin-top:18px;">Declaration</h4>'
    + (opts.siteWorkGate
        ? '<div class="pseaf-pow-note"><b>Point of Work Check:</b> completed on site on the day of the visit, using the PSEAF file saved in the project folder. It is not completed at project set-up.</div>'
        : '<div class="pseaf-pow" id="'+p+'PowBlock">'
          + '<div class="pseaf-chk"><input type="checkbox" id="'+p+'Pow"><label for="'+p+'Pow"><b>Point of Work Check:</b> '+escapeHtml(PSEAF_POW_TEXT)+'</label></div>'
          + '<div class="grid">'
          +   '<div class="field"><label for="'+p+'PowAt">Date and time of check</label><input type="datetime-local" id="'+p+'PowAt"></div>'
          + '</div>'
          + '<div class="pseaf-req-msg" id="'+p+'PowMsg"></div>'
          + '</div>')
    + '<div class="pseaf-decl">I confirm that:<ul>'+declLi+'</ul></div>'
    + '<h4 class="pseaf-sub" style="margin-top:18px;">Staff sign-off<span class="req">*</span></h4>'
    + '<p class="hint" style="margin-left:0;" id="'+p+'StaffHint">'
    +   (opts.siteWorkGate
          ? 'Confirm your details here'
          : 'Record everyone working on the project, including the Project Manager. Enter the name and contact number for each person and ask them to sign with their finger on screen.')
    + '</p>'
    + '<div id="'+p+'StaffRows"></div>'
    + '<div class="pseaf-req-msg" id="'+p+'StaffMsg"></div>'
    + '<button type="button" class="btn-ghost" id="'+p+'AddStaff">+ Add person</button>'
    + '</section>';

  host.innerHTML = html;

  /* Point of work check: ticking it stamps the current date and time and
     the first named member of staff, both of which stay editable. */
  const powCb = document.getElementById(p+'Pow');
  if(powCb){
    powCb.addEventListener('change', function(){
      if(!powCb.checked){ return; }
      const at = document.getElementById(p+'PowAt');
      if(at && !at.value){
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        at.value = now.toISOString().slice(0,16);
      }
    });
  }
  const svCb = document.getElementById(p+'SubVerify');
  if(svCb){
    svCb.addEventListener('change', function(){
      const dt = document.getElementById(p+'SubVerifyDate');
      if(svCb.checked && dt && !dt.value){ dt.value = new Date().toISOString().slice(0,10); }
    });
  }

  /* ---- Conditional reveals ------------------------------------------
     Subcontractor checklist, the lone working assessment, and the
     night-time justification each stay hidden until confirmed. ------- */
  function gateVal(key){
    const r = document.querySelector('input[name="'+p+key+'"]:checked');
    return r ? r.value : '';
  }
  function nightSelected(){
    for(let i=0;i<PSEAF_LONE_NIGHT.length;i++){
      const r = document.querySelector('input[name="'+p+'lnt_'+i+'"]:checked');
      if(r && r.value === 'Yes'){ return true; }
    }
    return false;
  }
  /* Renumber the visible sections so hiding a block never leaves a gap. */
  function sectionVisible(sec){
    let el = sec;
    while(el && el !== host){
      if(el.classList && el.classList.contains('pseaf-reveal') && !el.classList.contains('open')){ return false; }
      el = el.parentNode;
    }
    return true;
  }
  function renumberSections(){
    let i = startNum;
    host.querySelectorAll('section.card').forEach(function(sec){
      const badge = sec.querySelector('h2 .num');
      if(!badge){ return; }
      if(sectionVisible(sec)){ badge.textContent = i++; }
      else { badge.textContent = ''; }
    });
  }
  PSEAF_RENUMBER[p] = renumberSections;

  function syncReveals(){
    const subOn  = gateVal('SubUsed')  === 'Yes';
    const loneOn = gateVal('LoneUsed') === 'Yes';
    /* Site work gate controls the kit + lone working block, and whether
       the full set of site contacts is required here or deferred. */
    if(opts.siteWorkGate){
      const swBlock = document.getElementById(p+'SiteWorkBlock');
      const swOn = gateVal('SiteWork') === 'Yes';
      if(swBlock){ swBlock.classList.toggle('open', swOn); }
      const swGate = document.getElementById(p+'SiteWorkGate');
      if(swGate){ swGate.classList.toggle('unanswered', gateVal('SiteWork') === ''); }

      const cBlock = document.getElementById(p+'ContactsBlock');
      if(cBlock){ cBlock.classList.toggle('open', swOn); }
      const cHint = document.getElementById(p+'ContactsHint');
      if(cHint){
        cHint.textContent = swOn
          ? 'You are attending site, so record the emergency, next of kin and client contacts here. Individual staff numbers are recorded at the sign-off below.'
          : 'The office number is included automatically. Emergency, next of kin and client contacts are added by the field engineer before the site visit. Staff numbers are recorded at the sign-off below.';
      }
    }
    renumberSections();
    const subBlock   = document.getElementById(p+'SubBlock');
    const loneBlock  = document.getElementById(p+'LoneBlock');
    const nightBlock = document.getElementById(p+'NightBlock');
    const subGate  = document.getElementById(p+'SubUsedGate');
    const loneGate = document.getElementById(p+'LoneUsedGate');
    if(subGate){  subGate.classList.toggle('unanswered',  gateVal('SubUsed')  === ''); }
    if(loneGate){ loneGate.classList.toggle('unanswered', gateVal('LoneUsed') === ''); }
    if(subBlock){  subBlock.classList.toggle('open', subOn); }
    if(loneBlock){ loneBlock.classList.toggle('open', loneOn); }
    /* Highlight any lone working question still unanswered */
    if(loneBlock){
      loneBlock.querySelectorAll('[data-lone-q]').forEach(function(row){
        const key = row.getAttribute('data-lone-q');
        const answered = !!document.querySelector('input[name="'+p+key+'"]:checked');
        row.classList.toggle('unanswered', loneOn && !answered);
      });
    }

    /* Night justification only matters when lone working applies */
    const nightOn = loneOn && nightSelected();
    if(nightBlock){ nightBlock.classList.toggle('open', nightOn); }
    if(typeof PSEAF_SIG_HOOKS[p] === 'function'){ PSEAF_SIG_HOOKS[p](); }
  }
  host.addEventListener('change', syncReveals);
  PSEAF_REVEAL_SYNC[p] = syncReveals;

  /* ---- Activity presets -------------------------------------------
     Ticking an activity rebuilds the suggested assessment from the
     hazard library, merging the hazards for every selected activity and
     removing duplicates. The text stays fully editable: if the user has
     changed it, their wording is kept and a reset link is offered. ---- */
  const raBox    = document.getElementById(p+'SiteRA');
  const raMsg    = document.getElementById(p+'ActMsg');
  const raGrid   = document.getElementById(p+'ActGrid');
  let   raAuto   = '';   /* the last text this tool generated */

  function pseafSelectedActivities(){
    const out = [];
    if(!raGrid){ return out; }
    raGrid.querySelectorAll('input[type="checkbox"][data-act]').forEach(function(cb){
      if(cb.checked){ out.push(cb.getAttribute('data-act')); }
    });
    return out;
  }

  function pseafRaMessage(ids, hazCount, kept){
    if(!raMsg){ return; }
    if(!ids.length){
      raMsg.textContent = 'No activities selected. Tick the activities above, or write the assessment yourself.';
      raMsg.className = 'pseaf-req-msg';
      return;
    }
    let t = ids.length + ' activit' + (ids.length > 1 ? 'ies' : 'y') + ' selected. '
          + hazCount + ' hazard' + (hazCount === 1 ? '' : 's') + ' included, duplicates removed.';
    if(kept){ t += ' Your edited text has been kept. Use Reset to replace it with the suggestion.'; }
    raMsg.textContent = t;
    raMsg.className = 'pseaf-req-msg ok';
  }

  function pseafApplyActivities(force){
    const ids  = pseafSelectedActivities();
    const haz  = pseafHazardIdsFor(ids);
    const text = ids.length ? pseafHazardText(ids) : '';

    if(raGrid){
      raGrid.querySelectorAll('input[type="checkbox"][data-act]').forEach(function(cb){
        const row = cb.parentNode;
        if(row && row.classList){ row.classList.toggle('act-on', cb.checked); }
      });
    }

    if(!raBox){ pseafRaMessage(ids, haz.length, false); return; }

    const current   = (raBox.value || '').trim();
    const untouched = (current === '') || (current === (raAuto || '').trim());

    if(force || untouched){
      raBox.value = text;
      raAuto = text;
      pseafRaMessage(ids, haz.length, false);
    } else {
      /* Preserve the user's own wording. */
      pseafRaMessage(ids, haz.length, true);
    }
    if(typeof PSEAF_SIG_HOOKS[p] === 'function'){ PSEAF_SIG_HOOKS[p](); }
  }

  if(raGrid){
    raGrid.addEventListener('change', function(e){
      if(e.target && e.target.getAttribute && e.target.getAttribute('data-act')){
        pseafApplyActivities(false);
      }
    });
    /* Reset control, added after the message line */
    const resetWrap = document.createElement('div');
    resetWrap.style.margin = '2px 0 4px';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn-ghost btn-mini';
    resetBtn.textContent = 'Reset text to suggestion';
    resetBtn.addEventListener('click', function(){ pseafApplyActivities(true); });
    resetWrap.appendChild(resetBtn);
    if(raMsg && raMsg.parentNode){ raMsg.parentNode.insertBefore(resetWrap, raMsg.nextSibling); }
  }
  pseafApplyActivities(false);

  /* Wire up the repeatable sign-off rows */
  /* Each sign-off row carries an optional signature image. The picked file
     is downscaled to a transparent-friendly PNG data URI and stored on the
     row itself, so it can be embedded directly in the PDF. */
  function addRow(containerId, cls, placeholder, noSig){
    const c = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'pseaf-sig';
    /* Contact details are captured here rather than in the contacts block,
       so the Project Manager and every other attendee are recorded with
       their signature on one line. */
    const contactCls = cls.replace(/Name$/, 'Contact');
    /* Subcontractors are recorded by name and number only; they do not sign
       this form, so the signature control is omitted for those rows. */
    if(noSig){ row.classList.add('no-sig'); }
    row.innerHTML = '<span class="pseaf-cap">'+escapeHtml(placeholder)+'</span>'
      + '<input type="text" class="'+cls+'" placeholder="'+placeholder+'">'
      + '<span class="pseaf-cap">Contact number</span>'
      + '<input type="tel" class="'+contactCls+'" placeholder="Contact number">'
      + (noSig ? '' :
          '<span class="pseaf-cap">Signature</span>'
          + '<div class="pseaf-sigbox">'
          +   '<button type="button" class="pseaf-sigdraw"><span aria-hidden="true">&#9997;</span>'
          +     '<span class="first">Sign with finger</span><span class="again">Sign again</span></button>'
          +   '<img class="pseaf-sigimg" alt="Signature. Tap to sign again.">'
          +   '<label class="pseaf-siglbl">'
          +     '<input type="file" class="pseaf-sigfile" accept="image/png,image/jpeg,image/gif,image/webp">'
          +     '<span class="pseaf-sigcta">or upload an image</span>'
          +   '</label>'
          +   '<button type="button" class="pseaf-sigclear" title="Remove signature">&times;</button>'
          + '</div>')
      + '<button type="button" class="pseaf-del" title="Remove row">&times;</button>';

    const fileInput = row.querySelector('.pseaf-sigfile');
    const preview   = row.querySelector('.pseaf-sigimg');
    const cta       = row.querySelector('.pseaf-sigcta');
    const clearBtn  = row.querySelector('.pseaf-sigclear');

    if(!fileInput){
      /* No signature on this row: wire the delete control and finish. */
      row.querySelector('.pseaf-del').addEventListener('click', function(){
        row.remove();
        if(typeof onSigChange === 'function'){ onSigChange(); }
      });
      c.appendChild(row);
      return;
    }

    function clearSig(){
      row.dataset.sig = '';
      preview.removeAttribute('src');
      row.classList.remove('has-sig');
      cta.textContent = 'or upload an image';
      fileInput.value = '';
      if(typeof onSigChange === 'function'){ onSigChange(); }
    }
    clearBtn.addEventListener('click', clearSig);

    /* Sign with a finger or stylus (phones and tablets) */
    const drawBtn = row.querySelector('.pseaf-sigdraw');
    function openPad(){
      const nameEl = row.querySelector('input[type="text"]');
      const who = nameEl ? nameEl.value.trim() : '';
      pseafDrawSignature(function(url){
        row.dataset.sig = url;
        preview.src = url;
        row.classList.add('has-sig');
        cta.textContent = 'or upload an image';
        fileInput.value = '';
        if(typeof onSigChange === 'function'){ onSigChange(); }
      }, who);
    }
    if(drawBtn && typeof pseafDrawSignature === 'function'){
      drawBtn.addEventListener('click', openPad);
      preview.addEventListener('click', openPad);
    }

    fileInput.addEventListener('change', function(){
      const f = fileInput.files && fileInput.files[0];
      if(!f){ return; }
      if(!/^image\//.test(f.type)){
        cta.textContent = 'Not an image file';
        return;
      }
      if(f.size > 4 * 1024 * 1024){
        cta.textContent = 'Image too large (max 4 MB)';
        return;
      }
      cta.textContent = 'Reading...';
      const reader = new FileReader();
      reader.onload = function(ev){
        const img = new Image();
        img.onload = function(){
          /* Downscale so the PDF stays a sensible size. Signatures are wide
             and short, so cap the width and keep the aspect ratio. */
          const maxW = 420, maxH = 150;
          let w = img.width, h = img.height;
          const scale = Math.min(maxW / w, maxH / h, 1);
          w = Math.round(w * scale); h = Math.round(h * scale);
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          row.dataset.sig = cv.toDataURL('image/png');
          preview.src = row.dataset.sig;
          row.classList.add('has-sig');
          cta.textContent = 'or upload an image';
          if(typeof onSigChange === 'function'){ onSigChange(); }
        };
        img.onerror = function(){ cta.textContent = 'Could not read that image'; };
        img.src = ev.target.result;
      };
      reader.onerror = function(){ cta.textContent = 'Could not read that file'; };
      reader.readAsDataURL(f);
    });

    row.querySelector('.pseaf-del').addEventListener('click',function(){
      row.remove();
      if(typeof onSigChange === 'function'){ onSigChange(); }
    });
    c.appendChild(row);
  }
  PSEAF_ADD_ROW[p] = addRow;
  document.getElementById(p+'AddStaff').addEventListener('click',function(){ addRow(p+'StaffRows', p+'StaffName','Name'); });
  document.getElementById(p+'AddSub').addEventListener('click',function(){ addRow(p+'SubRows', p+'SubName','Subcontractor name / company', true); });
  addRow(p+'StaffRows', p+'StaffName','Name');
  addRow(p+'SubRows',   p+'SubName','Subcontractor name / company', true);

  syncReveals();

  /* Default the assessment date to today */
  const dt = document.getElementById(p+'Date');
  if(dt){ dt.valueAsDate = new Date(); }

  return n; /* next available step number */
}


/* ---- Staff sign-off validation (shared by both flows) ----
   At least one person must be recorded, and every recorded person must
   have both a name and an uploaded signature. */
function pseafStaffState(p){
  const rows = document.querySelectorAll('#'+p+'StaffRows .pseaf-sig');
  let total = 0, named = 0, signed = 0, contacted = 0, incomplete = 0;
  rows.forEach(function(row){
    total++;
    const nameEl = row.querySelector('.'+p+'StaffName');
    const conEl  = row.querySelector('.'+p+'StaffContact');
    const hasName = !!(nameEl && nameEl.value.trim());
    const hasCon  = !!(conEl && conEl.value.trim());
    const hasSig  = !!row.dataset.sig;
    if(hasName) named++;
    if(hasName && hasSig) signed++;
    if(hasName && hasCon) contacted++;
    if(hasName !== hasSig) incomplete++;
    if(hasName && !hasSig){ row.classList.add('needs-sig'); } else { row.classList.remove('needs-sig'); }
    /* Contact is captured here now that the standalone PM number is gone. */
    reqMark(conEl, hasName && !hasCon);
  });
  return { total:total, named:named, signed:signed, contacted:contacted, incomplete:incomplete,
           ok:(named > 0 && signed === named && contacted === named && incomplete === 0) };
}

function pseafStaffMessage(p){
  const st = pseafStaffState(p);
  const el = document.getElementById(p+'StaffMsg');
  if(!el){ return st; }
  if(st.named === 0){
    el.textContent = 'At least one member of staff must be recorded and signed off.';
    el.className = 'pseaf-req-msg show';
  } else if(st.contacted < st.named){
    el.textContent = (st.named - st.contacted) + ' of ' + st.named + ' recorded staff still need a contact number.';
    el.className = 'pseaf-req-msg show';
  } else if(st.signed < st.named){
    el.textContent = (st.named - st.signed) + ' of ' + st.named + ' recorded staff still need to sign.';
    el.className = 'pseaf-req-msg show';
  } else {
    el.textContent = st.signed + ' of ' + st.named + ' staff recorded with contact details and signature.';
    el.className = 'pseaf-req-msg ok';
  }
  return st;
}




/* ---- Subcontractor details ----
   Only required when the subcontractor gate is answered Yes. Each row
   needs a name and a contact number; no signature is collected. */
function pseafSubState(p){
  const gateEl = document.querySelector('input[name="'+p+'SubUsed"]:checked');
  const subOn = gateEl ? gateEl.value === 'Yes' : false;
  const el = document.getElementById(p+'SubMsg');

  if(!subOn){
    if(el){ el.textContent = ''; el.className = 'pseaf-req-msg'; }
    return { required:false, named:0, contacted:0, ok:true };
  }

  const rows = document.querySelectorAll('#'+p+'SubRows .pseaf-sig');
  let named = 0, contacted = 0;
  rows.forEach(function(row){
    const nameEl = row.querySelector('.'+p+'SubName');
    const conEl  = row.querySelector('.'+p+'SubContact');
    const hasName = !!(nameEl && nameEl.value.trim());
    const hasCon  = !!(conEl && conEl.value.trim());
    if(hasName) named++;
    if(hasName && hasCon) contacted++;
    reqMark(conEl, hasName && !hasCon);
  });

  const ok = named > 0 && contacted === named;
  if(el){
    if(named === 0){
      el.textContent = 'Record the name and contact number of at least one subcontractor.';
      el.className = 'pseaf-req-msg show';
    } else if(contacted < named){
      el.textContent = (named - contacted) + ' of ' + named + ' subcontractors still need a contact number.';
      el.className = 'pseaf-req-msg show';
    } else {
      el.textContent = named + ' subcontractor' + (named > 1 ? 's' : '') + ' recorded with contact details.';
      el.className = 'pseaf-req-msg ok';
    }
  }
  return { required:true, named:named, contacted:contacted, ok:ok };
}

/* ---- Subcontractor RAMS and insurance verification ----
   Mandatory on site (standalone and editable template) whenever a
   subcontractor is used. At project set-up (Convert) it is optional,
   because the documents may not have been received yet; the record then
   states clearly that work must not commence. */
function pseafSubVerifyState(p){
  const o = PSEAF_OPTS[p] || {};
  const gateEl = document.querySelector('input[name="'+p+'SubUsed"]:checked');
  const subOn = !!(gateEl && gateEl.value === 'Yes');
  const cb  = document.getElementById(p+'SubVerify');
  const by  = document.getElementById(p+'SubVerifyBy');
  const dt  = document.getElementById(p+'SubVerifyDate');
  const msg = document.getElementById(p+'SubVerifyMsg');
  const required = subOn && !o.siteWorkGate;
  const ticked = !!(cb && cb.checked);
  const hasBy = !!(by && by.value.trim());
  const hasDt = !!(dt && dt.value);
  let ok = true, text = '', cls = 'pseaf-req-msg';
  if(subOn){
    if(ticked && (!hasBy || !hasDt)){
      ok = false; cls += ' show';
      text = 'Enter who verified the subcontractor RAMS and insurance, and the date.';
    } else if(!ticked && required){
      ok = false; cls += ' show';
      text = 'The PM or Lead Consultant on site must confirm the subcontractor RAMS and insurance have been reviewed and approved before work commences.';
    } else if(!ticked){
      cls += ' show';
      text = 'Not yet verified. The completed PSEAF will state that work must not commence until this is confirmed.';
    } else {
      cls += ' ok';
      text = 'Subcontractor RAMS and insurance verified.';
    }
  }
  reqMark(by, subOn && ticked && !hasBy);
  reqMark(dt, subOn && ticked && !hasDt);
  if(msg){ msg.textContent = text; msg.className = cls; }
  return { required:required, ticked:ticked, ok:ok };
}

/* ---- Point of work check ----
   Not mandatory, because the form may be prepared before the visit. If it
   is ticked, the name and time of the check are required. If it is left
   unticked, the completed PSEAF states plainly that it was not done. */
function pseafPowState(p){
  const cb = document.getElementById(p+'Pow');
  if(!cb){ return { present:false, ticked:false, ok:true }; }
  const by  = document.getElementById(p+'Pm');   /* Your name, section 1 */
  const at  = document.getElementById(p+'PowAt');
  const msg = document.getElementById(p+'PowMsg');
  const ticked = cb.checked;
  const hasBy = !!(by && by.value.trim());
  const hasAt = !!(at && at.value);
  const ok = !ticked || (hasBy && hasAt);
  reqMark(at, ticked && !hasAt);
  if(msg){
    if(!ticked){
      msg.textContent = 'Tick this on site on the day of the visit. If left unticked, the completed PSEAF records the point of work check as not completed.';
      msg.className = 'pseaf-req-msg';
    } else if(!ok){
      msg.textContent = !hasBy ? 'Enter your name in Project details. It is used for the point of work check.' : 'Enter the date and time of the check.';
      msg.className = 'pseaf-req-msg show';
    } else {
      msg.textContent = 'Point of work check recorded for ' + by.value.trim() + '.';
      msg.className = 'pseaf-req-msg ok';
    }
  }
  return { present:true, ticked:ticked, ok:ok };
}

/* =====================================================================
   OUTSTANDING ITEMS
   A single component used by all three views. It highlights any
   unanswered mandatory input in the orange warning hue and renders a
   checklist of what is still missing immediately above the submit
   button, so the user never has to hunt up the page.
   ===================================================================== */

/* Mark or clear the warning state on a single field */
function reqMark(el, missing){
  if(!el){ return; }
  el.classList.toggle('req-missing', !!missing);
  const field = el.closest ? el.closest('.field') : null;
  if(field){ field.classList.toggle('req-missing-field', !!missing); }
}

/* Mark a radio/toggle group by its container */
function reqMarkGroup(container, missing){
  if(!container){ return; }
  container.classList.toggle('req-missing-group', !!missing);
}

/* Readable label for a field, taken from its own <label> where possible */
function reqLabel(id, fallback){
  const el = document.getElementById(id);
  if(el){
    const field = el.closest ? el.closest('.field') : null;
    const lab = field ? field.querySelector('label') : null;
    if(lab){
      return lab.textContent.replace(/\*$/,'').trim();
    }
  }
  return fallback || id;
}

/* Check a list of text/select inputs, highlight them, and return the
   labels of any that are empty. */
function reqCheckFields(ids, labels){
  const missing = [];
  ids.forEach(function(id){
    const el = document.getElementById(id);
    const empty = !el || !(el.value||'').trim();
    reqMark(el, empty);
    if(empty){ missing.push((labels && labels[id]) || reqLabel(id, id)); }
  });
  return missing;
}

/* Render the checklist panel above the submit button */
function reqRenderPanel(panelId, items){
  const panel = document.getElementById(panelId);
  if(!panel){ return; }
  if(!items.length){
    panel.className = 'req-panel done';
    panel.innerHTML = '<div class="req-panel-head">'
      + '<span class="req-tick">&#10003;</span>'
      + '<b>Everything required has been completed</b></div>';
    return;
  }
  let li = '';
  items.forEach(function(t){ li += '<li>'+escapeHtml(t)+'</li>'; });
  panel.className = 'req-panel show';
  panel.innerHTML = '<div class="req-panel-head">'
    + '<span class="req-bang">!</span>'
    + '<b>' + items.length + ' item' + (items.length > 1 ? 's' : '') + ' still to complete</b></div>'
    + '<ul class="req-list">' + li + '</ul>';
}

/* ---- Mandatory Yes/No gates ----
   The subcontractor and lone working questions must both be answered
   explicitly before a PSEAF can be produced. */
function pseafGateState(p){
  function val(key){
    const r = document.querySelector('input[name="'+p+key+'"]:checked');
    return r ? r.value : '';
  }
  /* A gate that was not rendered for this flow is not applicable. */
  function present(key){
    return !!document.querySelector('input[name="'+p+key+'"]');
  }
  const subOn  = present('SubUsed');
  const loneOn = present('LoneUsed');
  const sub  = subOn  ? val('SubUsed')  : 'n/a';
  const lone = loneOn ? val('LoneUsed') : 'n/a';
  const missing = [];
  if(subOn  && !sub)  missing.push('subcontractor');
  if(loneOn && !lone) missing.push('lone working');

  function msg(key, value, label){
    const el = document.getElementById(p+key+'Msg');
    if(!el){ return; }
    if(!value){
      el.textContent = 'Please answer the ' + label + ' question.';
      el.className = 'pseaf-req-msg show';
    } else {
      el.textContent = '';
      el.className = 'pseaf-req-msg';
    }
  }
  if(subOn){  msg('SubUsed',  sub,  'subcontractor'); }
  if(loneOn){ msg('LoneUsed', lone, 'lone working'); }

  return { sub:sub, lone:lone, missing:missing, ok:(missing.length === 0) };
}


/* ---- Lone working questions ----
   Once lone working is confirmed, every question must be answered.
   There is no N/A: the gate has already established relevance. */
function pseafLoneState(p){
  const gateEl = document.querySelector('input[name="'+p+'LoneUsed"]:checked');
  const loneOn = gateEl ? gateEl.value === 'Yes' : false;
  const el = document.getElementById(p+'LoneQMsg');

  if(!loneOn){
    if(el){ el.textContent = ''; el.className = 'pseaf-req-msg'; }
    return { required:false, total:0, answered:0, ok:true };
  }

  const keys = [];
  PSEAF_LONE_NO.forEach(function(q,i){ keys.push('ln_'+i); });
  PSEAF_LONE_YES.forEach(function(q,i){ keys.push('ly_'+i); });
  PSEAF_LONE_NIGHT.forEach(function(q,i){ keys.push('lnt_'+i); });

  let answered = 0;
  keys.forEach(function(k){
    if(document.querySelector('input[name="'+p+k+'"]:checked')){ answered++; }
  });
  const ok = answered === keys.length;

  if(el){
    if(ok){
      el.textContent = 'All ' + keys.length + ' lone working questions answered.';
      el.className = 'pseaf-req-msg ok';
    } else {
      const left = keys.length - answered;
      el.textContent = left + ' lone working question' + (left > 1 ? 's' : '') + ' still to be answered.';
      el.className = 'pseaf-req-msg show';
    }
  }
  return { required:true, total:keys.length, answered:answered, ok:ok };
}

/* ---- Night-time lone working justification ----
   Required only when lone working applies and a night-time visit is
   confirmed. */
function pseafNightState(p){
  const loneEl = document.querySelector('input[name="'+p+'LoneUsed"]:checked');
  const loneOn = loneEl ? loneEl.value === 'Yes' : false;
  let night = false;
  for(let i=0;i<PSEAF_LONE_NIGHT.length;i++){
    const r = document.querySelector('input[name="'+p+'lnt_'+i+'"]:checked');
    if(r && r.value === 'Yes'){ night = true; break; }
  }
  const required = loneOn && night;
  const el = document.getElementById(p+'NightJust');
  const text = el ? (el.value||'').trim() : '';
  const msg = document.getElementById(p+'NightMsg');
  const ok = !required || text.length >= 15;
  if(msg){
    if(!required){
      msg.textContent = '';
      msg.className = 'pseaf-req-msg';
    } else if(!text){
      msg.textContent = 'A site specific risk assessment justification is required for night-time lone working.';
      msg.className = 'pseaf-req-msg show';
    } else if(text.length < 15){
      msg.textContent = 'Please give a fuller justification.';
      msg.className = 'pseaf-req-msg show';
    } else {
      msg.textContent = 'Justification recorded.';
      msg.className = 'pseaf-req-msg ok';
    }
  }
  return { required:required, ok:ok, text:text };
}

/* ---- Read the PSEAF fields for a given prefix ---- */
function readPseaf(p, override){
  override = override || {};
  function v(id){ const e=document.getElementById(p+id); return e ? (e.value||'').trim() : ''; }
  function c(id){ const e=document.getElementById(p+id); return !!(e && e.checked); }
  function ynv(key,i){ const r=document.querySelector('input[name="'+p+key+'_'+i+'"]:checked'); return r ? r.value : ''; }

  function gv(key){
    const r = document.querySelector('input[name="'+p+key+'"]:checked');
    return r ? r.value : '';
  }
  const subUsed  = gv('SubUsed')  === 'Yes';
  const loneUsed = gv('LoneUsed') === 'Yes';

  const kit   = PSEAF_KIT.map(function(k,i){ return { item:k, on:c('kit_'+i) }; });
  const o = PSEAF_OPTS[p] || {};
  const siteRA = v('SiteRA');
  const kitOther = v('KitOther');
  const activities = PSEAF_ACTIVITIES.filter(function(a){ return c('act_'+a.id); }).map(function(a){ return a.name; });
  const lone  = {
    used:  loneUsed,
    no:    PSEAF_LONE_NO.map(function(q,i){ return { q:q, a:ynv('ln',i) }; }),
    yes:   PSEAF_LONE_YES.map(function(q,i){ return { q:q, a:ynv('ly',i) }; }),
    night: PSEAF_LONE_NIGHT.map(function(q,i){ return { q:q, a:ynv('lnt',i) }; })
  };
  const nightWorking = loneUsed && lone.night.some(function(x){ return x.a === 'Yes'; });
  const nightJust = v('NightJust');
  function collectRows(cls){
    const out = [];
    const contactCls = cls.replace(/Name$/, 'Contact');
    document.querySelectorAll('.'+cls).forEach(function(el){
      const name = (el.value||'').trim();
      if(!name){ return; }
      const row = el.closest('.pseaf-sig');
      const cEl = row ? row.querySelector('.'+contactCls) : null;
      out.push({
        name:name,
        contact:(cEl && cEl.value) ? cEl.value.trim() : '',
        sig:(row && row.dataset.sig) ? row.dataset.sig : ''
      });
    });
    return out;
  }
  const staff = collectRows(p+'StaffName');
  const subNames = collectRows(p+'SubName').map(function(r){ return r.name; });
  const subRowsSigned = collectRows(p+'SubName');

  return {
    projNo:  override.projNo  !== undefined ? override.projNo  : v('ProjNo'),
    client:  override.client  !== undefined ? override.client  : v('Client'),
    pm:      override.pm      !== undefined ? override.pm      : v('Pm'),
    folder:  override.folder  !== undefined ? override.folder  : v('Folder'),
    desc:    v('Desc'),
    site:    v('Site'),
    date:    v('Date') || new Date().toISOString().slice(0,10),
    siteRA:siteRA, kitOther:kitOther, activities:activities,
    specProc:v('SpecProc') || '(none)',
    specRA:  v('SpecRA')   || '(none)',
    contacts:{ office:v('cOffice')||'018474220', emerg:v('cEmerg')||'(not given)', client:v('cClient')||'N/A',
               local:v('cLocal')||'(not given)' },
    subVerify:{ done:c('SubVerify'), by:v('SubVerifyBy'), date:v('SubVerifyDate') },
    pow:{ present:!!document.getElementById(p+'Pow'), done:c('Pow'), by:v('Pm'), at:v('PowAt') },
    kit:kit, lone:lone, staff:staff, subNames:subNames, subSigned:subRowsSigned,
    subUsed:subUsed, loneUsed:loneUsed, nightWorking:nightWorking, nightJust:nightJust,
    subAnswered:(gv('SubUsed') !== ''), loneAnswered:(gv('LoneUsed') !== ''),
    /* Which sections were NOT presented on this page. The PDF renderer
       uses these to omit them entirely rather than printing unanswered
       questions the user was never shown. */
    /* With the site work gate, the sections are deferred only when the
       person completing this form is not the one attending site. */
    kitDeferred: o.siteWorkGate ? (gv('SiteWork') !== 'Yes') : !!o.skipKit,
    loneDeferred: o.siteWorkGate ? (gv('SiteWork') !== 'Yes') : !!o.skipLone,
    siteWorkBySelf: o.siteWorkGate ? (gv('SiteWork') === 'Yes') : true,
    siteWorkAnswered: o.siteWorkGate ? (gv('SiteWork') !== '') : true,
    /* Contacts are only reduced when the field engineer will complete
       them later, i.e. when this person is not attending site. */
    contactsMinimal: o.minimalContacts ? (o.siteWorkGate ? (gv('SiteWork') !== 'Yes') : true) : false
  };
}

/* ---- Render the PSEAF as print-ready A4 HTML for the PDF ---- */
function pseafPdfHtml(d){
  const tick = '&#9745;', box = '&#9744;';
  function row(label,val){ return '<tr><td class="k">'+escapeHtml(label)+'</td><td>'+escapeHtml(val||'')+'</td></tr>'; }

  let kitRows='';
  d.kit.forEach(function(k){ kitRows += '<tr><td class="c">'+(k.on?tick:box)+'</td><td>'+escapeHtml(k.item)+'</td></tr>'; });
  function loneTbl(arr){ let r=''; arr.forEach(function(x){ r += '<tr><td>'+escapeHtml(x.q)+'</td><td class="c b">'+escapeHtml(x.a || 'Not answered')+'</td></tr>'; }); return r; }
  function sigCell(sig){
    const okSig = typeof sig === 'string' && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/.test(sig);
    return okSig
      ? '<td class="sig"><img src="'+sig+'" class="sigimg" alt=""></td>'
      : '<td class="sig">&nbsp;</td>';
  }
  function signRow(r){
    return '<tr><td>'+escapeHtml(r.name)+'</td>'
         + '<td>'+escapeHtml(r.contact || '')+'</td>'
         + sigCell(r.sig)+'</tr>';
  }
  let staffRows = d.staff.length
      ? d.staff.map(signRow).join('')
      : '<tr><td>&nbsp;</td><td>&nbsp;</td><td class="sig">&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td class="sig">&nbsp;</td></tr>';
  const subSigned = d.subSigned || d.subNames.map(function(n){ return { name:n, contact:'', sig:'' }; });
  /* Subcontractors are listed by name and contact only; they do not sign. */
  function subRow(r){
    return '<tr><td>'+escapeHtml(r.name)+'</td><td>'+escapeHtml(r.contact || '')+'</td></tr>';
  }
  let subNameRows = subSigned.length
      ? subSigned.map(subRow).join('')
      : '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>';
  let stdRows='';
  PSEAF_STANDARD_CONTACTS.forEach(function(c){ stdRows += row(c[0], c[1]); });
  let declLi='';
  PSEAF_DECLARATION.forEach(function(t){ declLi += '<li>'+escapeHtml(t)+'</li>'; });

  /* ---- Section numbering ------------------------------------------
     Sections that were not presented on screen are omitted entirely
     rather than printed with a placeholder, so the PDF only ever shows
     questions the user was actually asked. Headings are numbered as they
     are emitted, so the sequence never has gaps. ------------------- */
  let __sec = 0;
  function sec(title){ return '<h2>' + (++__sec) + '. ' + escapeHtml(title) + '</h2>'; }

  /* Sections deferred to the field engineer, noted in the footer. */
  const deferred = [];
  if(d.kitDeferred){ deferred.push('essential kit checklist'); }
  if(d.loneDeferred){ deferred.push('lone working assessment'); }
  if(d.contactsMinimal){ deferred.push('local emergency, next of kin and client contacts'); }
  if(!d.pow || !d.pow.present){ deferred.push('point of work check'); }
  const deferredNote = deferred.length
    ? '<div class="pending">Completed at project set-up. The ' + escapeHtml(deferred.join(', '))
      + ' will be completed by the field engineer before or on the day of the site visit, using the PSEAF file saved in the project folder.</div>'
    : '';

  return ''
  + '<div class="pdfpage">'
  + '<div class="banner"><h1>AWN Risk Assessment &ndash; PSEAF</h1>'
  + '<div class="sub">Project Safety &amp; Environmental Assessment Form &middot; EHS-P-001-F1 &middot; A Trinity Consultants Company</div></div>'
  + sec('Project details')
  + '<table class="meta">'
  + row('Project number', d.projNo)
  + row('Project description', d.desc) + row('Site location', d.site)
  + row('Completed by', d.pm) + row('Assessment date', d.date)
  + '</table>'

  + sec('Site specific risk assessment')
  + (d.activities && d.activities.length
      ? '<div class="lbl">Activities: '+escapeHtml(d.activities.join(', '))+'</div>'
      : '')
  + '<table><tr><td>'+escapeHtml(d.siteRA || '(not given)').replace(/\n/g,'<br>')+'</td></tr></table>'
  + '<table><tr><td><b>Project specific procedures:</b> '+escapeHtml(d.specProc)+'</td><td><b>Project specific RA:</b> '+escapeHtml(d.specRA)+'</td></tr></table>'

  + sec('Subcontractors')
  + (d.subUsed
      ? '<div class="note">'+escapeHtml(PSEAF_SUB_NOTICE)+'</div>'
        + '<table><tr><th>Subcontractor</th><th style="width:150px;">Contact</th></tr>'+subNameRows+'</table>'
        + ((d.subVerify && d.subVerify.done)
            ? '<div class="pow">&#9745; <b>RAMS and insurance verified:</b> '+escapeHtml(PSEAF_SUB_VERIFY_TEXT)
              + '<br>Verified by <b>'+escapeHtml(d.subVerify.by)+'</b> on <b>'+escapeHtml(d.subVerify.date)+'</b></div>'
            : '<div class="pow no">&#9744; <b>Subcontractor RAMS and insurance NOT YET VERIFIED.</b> Work must not commence until the PM or Lead Consultant on site has reviewed and approved them.</div>')
      : '<div class="na">'+(d.subAnswered ? 'No subcontractor is being used on this project.' : 'Not answered.')+'</div>')

  /* Essential kit: omitted entirely when it was not on screen. */
  + (d.kitDeferred ? ''
      : sec('Essential kit checklist')
        + '<table>'+kitRows+'</table>'
        + (d.kitOther
            ? '<div class="lbl">Additional kit or equipment</div><table><tr><td>'+escapeHtml(d.kitOther)+'</td></tr></table>'
            : ''))

  /* Lone working: omitted entirely when it was not on screen. */
  + (d.loneDeferred ? ''
      : sec('Lone working assessment')
        + (d.loneUsed
            ? '<div class="note">If you answered <b>NO</b> to any of the below, <b>DO NOT</b> continue with the site visit.</div>'
              + '<table><tr><th>Question</th><th class="c" style="width:70px;">Answer</th></tr>'+loneTbl(d.lone.no)+'</table>'
              + '<div class="note">If you answered <b>YES</b> to the below, <b>DO NOT</b> continue with the site visit.</div>'
              + '<table><tr><th>Question</th><th class="c" style="width:70px;">Answer</th></tr>'+loneTbl(d.lone.yes)+'</table>'
              + '<div class="note">If you answered <b>YES</b> to the below, do not continue as a lone worker unless a site specific risk assessment permits it.</div>'
              + '<table><tr><th>Question</th><th class="c" style="width:70px;">Answer</th></tr>'+loneTbl(d.lone.night)+'</table>'
              + (d.nightWorking
                  ? '<div class="lbl">Site specific risk assessment justification for night-time lone working</div>'
                    + '<table><tr><td>'+escapeHtml(d.nightJust || '(not given)')+'</td></tr></table>'
                  : '')
            : '<div class="na">'+(d.loneAnswered ? 'Lone working is not required on this project.' : 'Not answered.')+'</div>'))

  + sec('Key contact phone numbers')
  + '<table class="meta">'
  + row('Office contact', d.contacts.office)
  /* Next of kin and client representative are only printed where they
     were asked for on the page. */
  + (d.contactsMinimal ? ''
      : row('Local site emergency contact', d.contacts.local)
        + row('Emergency contact / next of kin', d.contacts.emerg)
        + row('Client representative', d.contacts.client))
  + stdRows + '</table>'

  + sec('Declaration')
  + (!d.pow || !d.pow.present
      ? '<div class="pow no">&#9744; <b>Point of Work Check:</b> not completed at project set-up. To be completed on site on the day of the visit using the PSEAF file.</div>'
      : (d.pow.done
          ? '<div class="pow">&#9745; <b>Point of Work Check:</b> '+escapeHtml(PSEAF_POW_TEXT)
            + '<br>Confirmed on site by <b>'+escapeHtml(d.pow.by)+'</b> at <b>'+escapeHtml(String(d.pow.at).replace('T',' '))+'</b></div>'
          : '<div class="pow no">&#9744; <b>Point of Work Check: NOT COMPLETED.</b> This record does not confirm that site conditions were checked on the day.</div>'))
  + '<div class="decl">It is the responsibility of the Project Manager to ensure that all members of staff working on the project sign this declaration. I confirm that:<ul>'+declLi+'</ul></div>'
  + '<table><tr><th>Name (staff)</th><th style="width:110px;">Contact</th><th style="width:170px;">Signed</th></tr>'+staffRows+'</table>'

  + deferredNote
  + '<div class="foot">AWN Consulting Limited, The Tecpro Building, IDA Business &amp; Technology Park, Clonshaugh, Dublin 17, D17 XD90 &middot; Registered in Ireland No. 319812 &middot; EHS-P-001-F1 PSEAF</div>'
  + '</div>';
}

/* ---- Download manager ------------------------------------------------
   Chrome and Edge block a second programmatic download that follows too
   closely on the first, and when "automatic multiple downloads" is not
   allowed they block it SILENTLY. Both files are therefore built first,
   then released through a queue that spaces them apart, and every file is
   also offered as an explicit Download button, because a direct click is
   treated far more permissively than an automatic burst.
   -------------------------------------------------------------------- */
function pseafSaveBlob(blob, name){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  /* Long lifetime so slow Save As dialogs do not lose the blob. */
  setTimeout(function(){ URL.revokeObjectURL(url); }, 60000);
}

function pseafDownloadQueue(files, gapMs){
  const gap = (gapMs === undefined) ? 1200 : gapMs;
  return files.reduce(function(chain, f, i){
    return chain.then(function(){
      return new Promise(function(resolve){
        setTimeout(function(){
          try { pseafSaveBlob(f.blob, f.name); }
          catch(err){ console.error('Download failed for ' + f.name, err); }
          resolve();
        }, i === 0 ? 0 : gap);
      });
    });
  }, Promise.resolve());
}

function pseafRenderDownloads(containerId, files){
  const el = document.getElementById(containerId);
  if(!el){ return; }
  if(!files || !files.length){ el.style.display = 'none'; el.innerHTML = ''; return; }
  let h = '<div class="dl-head"><span class="dl-bang">&#8681;</span>'
    + '<div><b>PSEAF file for this project</b>'
    + '<span>The file should have downloaded automatically. If it did not appear, select it below.</span></div></div>'
    + '<div class="dl-row">';
  files.forEach(function(f, i){
    h += '<button type="button" class="dl-btn" data-dl="' + i + '">'
       + '<span class="dl-ico">&#8681;</span>'
       + '<span class="dl-name">' + escapeHtml(f.name) + '</span></button>';
  });
  h += '</div>';
  el.innerHTML = h;
  el.style.display = 'block';
  el.querySelectorAll('[data-dl]').forEach(function(btn){
    btn.addEventListener('click', function(){
      const f = files[parseInt(btn.getAttribute('data-dl'), 10)];
      if(f){ pseafSaveBlob(f.blob, f.name); }
    });
  });
}



/* =====================================================================
   PSEAF HTML TEMPLATE WRITER
   Produces a standalone, self-contained HTML copy of the PSEAF with the
   details captured here already filled in. The file is saved alongside
   the PDF in the project folder so the form can be reopened, amended and
   a fresh PDF produced later, without needing this add-in.

   The template always contains the FULL form, including the essential
   kit checklist and the lone working assessment, even where those were
   deferred on the Convert-to-Project page, because those are exactly the
   sections the field engineer completes nearer the site visit.

   The template is built by serialising the live functions and reference
   data from this page, so it can never drift out of step with the form
   the user has just completed.
   ===================================================================== */

/* Turn a value into safe JavaScript source for embedding in the template */
function tplLiteral(v){
  return JSON.stringify(v)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/* Build a filename: projectnumber_projectdescription_PSEAF_vN.html */
function pseafTemplateFileName(d, version){
  function clean(s, fallback){
    const t = String(s || '').trim().replace(/[\\\/:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ').trim().replace(/ /g, '-');
    return t ? t.slice(0, 60) : fallback;
  }
  const proj = clean(d && d.projNo, 'Project');
  const desc = clean(d && d.desc, 'PSEAF');
  return proj + '_' + desc + '_PSEAF_v' + (version || 1) + '.html';
}

/* Styles for the completed assessment as shown in, and printed from, the
   single PSEAF file. */
function pseafRecordCss(){
  return ''
    + '@page{size:A4;margin:12mm;}'
    + '#recView #pseafStage{position:static;left:auto;top:auto;width:auto;max-width:794px;margin:0 auto 22px;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);}'
    + '#pseafStage .pdfpage{width:100%;padding:26px 30px;font-family:Arial,Helvetica,sans-serif;font-size:10.5px;color:#414142;background:#fff;box-sizing:border-box;}'
    + '#pseafStage .banner{background:#0032A0;color:#fff;padding:14px 18px;border-radius:4px;margin-bottom:14px;}'
    + '#pseafStage .banner h1{font-size:17px;margin:0;font-weight:700;}'
    + '#pseafStage .banner .sub{font-size:9.5px;margin-top:3px;opacity:.92;}'
    + '#pseafStage h2{color:#0032A0;font-size:12px;border-bottom:2px solid #EF6323;padding-bottom:3px;margin:16px 0 7px;break-after:avoid;page-break-after:avoid;}'
    + '#pseafStage table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:10px;}'
    + '#pseafStage tr{break-inside:avoid;page-break-inside:avoid;}'
    + '#pseafStage td,#pseafStage th{border:1px solid #C8C9C7;padding:5px 7px;vertical-align:top;text-align:left;}'
    + '#pseafStage th{background:#0032A0;color:#fff;font-weight:600;}'
    + '#pseafStage table.meta td{border:none;padding:3px 7px;}'
    + '#pseafStage table.meta td.k{font-weight:700;color:#58595B;width:170px;}'
    + '#pseafStage td.c{text-align:center;font-size:13px;}'
    + '#pseafStage td.b{font-weight:700;}'
    + '#pseafStage td.sig{background:#fbfbfb;height:38px;vertical-align:middle;text-align:center;}'
    + '#pseafStage .sigimg{max-height:34px;max-width:180px;display:inline-block;}'
    + '#pseafStage .note{background:#fff6f0;border-left:3px solid #EF6323;padding:6px 10px;font-size:9.5px;margin:7px 0;}'
    + '#pseafStage .decl{font-size:9.5px;margin-bottom:8px;}'
    + '#pseafStage .decl ul{margin:6px 0 0;padding-left:16px;}'
    + '#pseafStage .decl li{margin-bottom:3px;}'
    + '#pseafStage .lbl{font-size:9.5px;font-weight:700;color:#58595B;margin:10px 0 4px;}'
    + '#pseafStage .pending{margin-top:14px;border:1px solid #C8C9C7;border-left:3px solid #0032A0;background:#f7f9fc;padding:7px 10px;font-size:9px;color:#58595B;}'
    + '#pseafStage .na{border:1px solid #C8C9C7;background:#fbfbfb;padding:7px 10px;font-size:10px;color:#58595B;font-style:italic;margin-bottom:8px;}'
    + '#pseafStage .pow{border:2px solid #0032A0;background:#f7f9fc;padding:8px 10px;font-size:10px;margin:6px 0 10px;}'
    + '#pseafStage .pow.no{border-color:#EF6323;background:#fff6f0;}'
    + '#pseafStage .foot{margin-top:18px;font-size:8px;color:#58595B;border-top:1px solid #C8C9C7;padding-top:7px;}'
    + '.rec-bar{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin:0 0 12px;}'
    + '.rec-bar .field{flex:1 1 260px;}'
    + '.rec-meta{font-size:.85rem;color:var(--grey);margin:0 0 14px;}'
    + '.rec-meta.ok{color:var(--seafoam);font-weight:500;}'
    + '@media print{'
    +   'header,footer,.intro,.rec-bar,.rec-meta,#formView{display:none !important;}'
    +   'body{background:#fff;}.wrap{padding:0;max-width:none;}'
    +   '#recView #pseafStage{border:none;box-shadow:none;margin:0;max-width:none;}'
    +   '#pseafStage .pdfpage{padding:0;}'
    +   '#pseafStage .banner,#pseafStage th{-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
    + '}';
}

/* =====================================================================
   SINGLE PSEAF FILE
   One self-contained HTML file per project. It holds every completed
   assessment (version history), shows the latest as a print-ready
   record, and lets the field engineer complete a further assessment.
   Completing one downloads ONE new file, version N+1, which replaces the
   previous file in the project folder. Only one download ever happens at
   a time, so Outlook and the browser do not block a second file.
   The file regenerates itself from the functions it carries, so it can
   never drift out of step with the add-in that created it.
   ===================================================================== */
function pseafTemplateHtml(history, draft){
  history = history || [];
  const latest = history.length ? history[history.length - 1].data : (draft || {});

  const styleEl = document.querySelector('style');
  const css = styleEl ? styleEl.textContent : '';
  const logoEl = document.querySelector('.brand-logo');
  const logoSrc = logoEl ? logoEl.getAttribute('src') : '';

  const consts = ''
    + 'const PSEAF_KIT = '               + tplLiteral(PSEAF_KIT) + ';\n'
    + 'const PSEAF_LONE_NO = '           + tplLiteral(PSEAF_LONE_NO) + ';\n'
    + 'const PSEAF_LONE_YES = '          + tplLiteral(PSEAF_LONE_YES) + ';\n'
    + 'const PSEAF_LONE_NIGHT = '        + tplLiteral(PSEAF_LONE_NIGHT) + ';\n'
    + 'const PSEAF_SUB_NOTICE = '        + tplLiteral(PSEAF_SUB_NOTICE) + ';\n'
    + 'const PSEAF_STANDARD_CONTACTS = ' + tplLiteral(PSEAF_STANDARD_CONTACTS) + ';\n'
    + 'const PSEAF_DECLARATION = '       + tplLiteral(PSEAF_DECLARATION) + ';\n'
    + 'const PSEAF_POW_TEXT = '          + tplLiteral(PSEAF_POW_TEXT) + ';\n'
    + 'const PSEAF_SUB_VERIFY_TEXT = '   + tplLiteral(PSEAF_SUB_VERIFY_TEXT) + ';\n'
    + 'const PSEAF_HAZARDS = '           + tplLiteral(PSEAF_HAZARDS) + ';\n'
    + 'const PSEAF_HAZARD_ORDER = '      + tplLiteral(PSEAF_HAZARD_ORDER) + ';\n'
    + 'const PSEAF_ACTIVITIES = '        + tplLiteral(PSEAF_ACTIVITIES) + ';\n'
    + 'const PSEAF_AE_SYNC = {};\n'
    + 'const PSEAF_SIG_HOOKS = {};\n'
    + 'const PSEAF_REVEAL_SYNC = {};\n'
    + 'const PSEAF_OPTS = {};\n'
    + 'const PSEAF_ADD_ROW = {};\n'
    + 'const PSEAF_RENUMBER = {};\n'
    + 'const HISTORY = ' + tplLiteral(history) + ';\n'
    + 'const DRAFT = ' + tplLiteral(draft || null) + ';\n';

  const fns = [
    escapeHtml, pseafHazardIdsFor, pseafHazardText, buildPseafSections,
    pseafStaffState, pseafStaffMessage,
    reqMark, reqMarkGroup, reqLabel, reqCheckFields, reqRenderPanel,
    pseafGateState, pseafSubState, pseafSubVerifyState, pseafPowState, pseafLoneState, pseafNightState,
    readPseaf, pseafPdfHtml, pseafRecordCss, pseafSaveBlob,
    tplLiteral, pseafTemplateFileName, pseafTemplateHtml, pseafFileRuntime, pseafDrawSignature
  ].map(function(f){
    return 'var ' + f.name + ' = ' + f.toString() + ';';
  }).join('\n\n');

  /* The file runs only its own inline code: no network, no external
     scripts, fonts or images. */
  const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; "
            + "img-src data: blob:; form-action 'none'; base-uri 'none'";

  return '<!DOCTYPE html>\n'
    + '<html lang="en-GB">\n<head>\n<meta charset="UTF-8">\n'
    + '<meta http-equiv="Content-Security-Policy" content="' + csp + '">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<title>PSEAF ' + escapeHtml(latest.projNo || '') + ' ' + escapeHtml(latest.desc || '') + ' | AWN Consulting</title>\n'
    + '<style>\n' + css + '\n</style>\n'
    + '<style>\n' + pseafRecordCss() + '\n</style>\n</head>\n<body>\n'
    + '<header>'
    + (logoSrc ? '<img class="brand-logo" src="' + logoSrc + '" alt="Trinity Consultants and AWN Consulting">' : '')
    + '<h1 class="title">Project Safety &amp; Environmental Assessment Form</h1>'
    + '<div class="subtitle">' + escapeHtml(latest.projNo || '') + ' &nbsp;&middot;&nbsp; ' + escapeHtml(latest.desc || '') + '</div>'
    + '</header>\n'
    + '<div class="wrap">\n'
    + '<div id="recView">'
    +   '<div class="intro">This is the PSEAF file for this project. It holds every completed assessment, with the latest shown below. '
    +   'To carry out a further assessment, for example on the day of a site visit, select <b>Start a new assessment</b>. '
    +   'When it is complete, a new version of this file is downloaded. Save it to the project folder in place of this one.</div>'
    +   '<div class="rec-bar">'
    +     '<div class="field"><label for="recSel">Completed assessments</label><select id="recSel"></select></div>'
    +     '<button type="button" class="btn" id="recNew">Start a new assessment</button>'
    +     '<button type="button" class="btn-ghost" id="recPrint">Print or save as PDF</button>'
    +   '</div>'
    +   '<div class="rec-meta" id="recMeta"></div>'
    +   '<div id="pseafStage">' + (history.length ? pseafPdfHtml(latest) : '') + '</div>'
    + '</div>\n'
    + '<div id="formView" style="display:none;">'
    +   '<button type="button" class="back-link" id="formBack">&#8592; Back to the completed assessments</button>'
    +   '<div class="intro">The answers from the latest assessment are already filled in. Update anything that has changed, '
    +   'tick the <b>Point of Work Check</b> on site, and make sure everyone attending has signed. Then select '
    +   '<b>Complete assessment</b> to download the new version of this file. Use <b>Save progress</b> to keep an unfinished assessment.</div>'
    +   '<form id="tplForm" novalidate><div id="tplHost"></div>\n'
    +   '<div class="req-panel" id="tplReqPanel"></div>\n'
    +   '<div class="actions">'
    +     '<button type="button" class="btn" id="tplDone" disabled>Complete assessment</button>'
    +     '<button type="button" class="btn-ghost" id="tplSave">Save progress</button>'
    +     '<span class="status" id="tplStatus"></span>'
    +   '</div></form>'
    + '</div>\n'
    + '<footer class="page-foot"><div class="bar"></div>'
    + 'AWN Consulting Ltd, The Tecpro Building, IDA Business &amp; Technology Park, Clonshaugh, Dublin 17, D17 XD90 &nbsp;|&nbsp; A Trinity Consultants company'
    + '<div class="version">PSEAF file &nbsp;|&nbsp; EHS-P-001-F1 &nbsp;|&nbsp; version ' + history.length + '</div>'
    + '</footer>\n</div>\n'
    + '<scr' + 'ipt>\n' + consts + '\n' + fns + '\n\npseafFileRuntime();\n<\/scr' + 'ipt>\n'
    + '</body>\n</html>';
}

/* Behaviour of the single PSEAF file. Defined here so it can be serialised
   into the file; it only runs inside the downloaded file. */
function pseafFileRuntime(){
  var P = 'tp';
  var history = HISTORY.slice();
  var draft = DRAFT;
  var built = false;

  var recView  = document.getElementById('recView');
  var formView = document.getElementById('formView');
  var recSel   = document.getElementById('recSel');
  var stage    = document.getElementById('pseafStage');
  var meta     = document.getElementById('recMeta');
  var btnNew   = document.getElementById('recNew');
  var btnDone  = document.getElementById('tplDone');
  var btnSave  = document.getElementById('tplSave');
  var statusEl = document.getElementById('tplStatus');

  function fmt(iso){
    var dt = new Date(iso);
    if(isNaN(dt.getTime())){ return String(iso || ''); }
    return dt.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
  function powDone(e){ return !!(e && e.data && e.data.pow && e.data.pow.done); }

  function fillSelect(sel){
    recSel.innerHTML = '';
    for(var i = history.length - 1; i >= 0; i--){
      var e = history[i];
      var o = document.createElement('option');
      o.value = String(i);
      o.textContent = 'Version ' + e.version + '  |  ' + fmt(e.savedAt) + (powDone(e) ? '  |  on site' : '  |  set-up');
      recSel.appendChild(o);
    }
    recSel.value = String(sel);
  }
  function showRecord(idx, note){
    var e = history[idx];
    if(!e){
      stage.innerHTML = '<div class="pdfpage"><div class="na">No completed assessment yet.</div></div>';
      meta.textContent = '';
      return;
    }
    stage.innerHTML = pseafPdfHtml(e.data);
    meta.className = note ? 'rec-meta ok' : 'rec-meta';
    meta.textContent = note || ('Version ' + e.version + ' of ' + history.length + ', saved ' + fmt(e.savedAt) + '. '
      + (powDone(e) ? 'Point of Work Check completed on site.' : 'Point of Work Check not completed in this version.'));
  }
  recSel.addEventListener('change', function(){ showRecord(parseInt(recSel.value, 10)); });
  document.getElementById('recPrint').addEventListener('click', function(){ window.print(); });

  function setVal(id, v){ var e = document.getElementById(P+id); if(e && v !== undefined && v !== null){ e.value = v; } }
  function setRadio(name, v){ if(!v){ return; } var r = document.querySelector('input[name="'+P+name+'"][value="'+v+'"]'); if(r){ r.checked = true; } }
  function setCheck(id, on){ var e = document.getElementById(P+id); if(e){ e.checked = !!on; } }

  function fillRows(container, cls, placeholder, rows, noSig){
    var host = document.getElementById(P+container);
    if(!host){ return; }
    host.innerHTML = '';
    var add = PSEAF_ADD_ROW[P];
    var list = rows.length ? rows : [{ name:'', contact:'', sig:'' }];
    list.forEach(function(r){
      add(P+container, P+cls, placeholder, noSig);
      var row = host.lastElementChild;
      if(!row){ return; }
      var nameEl = row.querySelector('.'+P+cls);
      if(nameEl){ nameEl.value = r.name || ''; }
      var conEl = row.querySelector('.'+P+cls.replace(/Name$/, 'Contact'));
      if(conEl){ conEl.value = r.contact || ''; }
      if(r.sig){
        row.dataset.sig = r.sig;
        var img = row.querySelector('.pseaf-sigimg');
        if(img){ img.src = r.sig; }
        row.classList.add('has-sig');
        var cta = row.querySelector('.pseaf-sigcta');
        if(cta){ cta.textContent = 'or upload an image'; }
      }
    });
  }

  /* isNew: a fresh assessment starts with today's date. The Point of Work
     Check is never carried forward: it must be completed afresh on site. */
  function applyPrefill(d, isNew){
    d = d || {};
    var c = d.contacts || {};
    setVal('ProjNo', d.projNo); setVal('Client', d.client); setVal('Pm', d.pm); setVal('Folder', d.folder);
    setVal('Desc', d.desc); setVal('Site', d.site);
    setVal('Date', isNew ? new Date().toISOString().slice(0,10) : d.date);
    setVal('SiteRA', d.siteRA); setVal('KitOther', d.kitOther);
    setVal('SpecProc', d.specProc === '(none)' ? '' : d.specProc);
    setVal('SpecRA',   d.specRA   === '(none)' ? '' : d.specRA);
    setVal('cOffice', c.office);
    setVal('cEmerg',  c.emerg  === '(not given)' ? '' : c.emerg);
    setVal('cClient', c.client);
    setVal('cLocal',  c.local  === '(not given)' ? '' : c.local);
    if(d.subVerify){ setCheck('SubVerify', d.subVerify.done); setVal('SubVerifyBy', d.subVerify.by); setVal('SubVerifyDate', d.subVerify.date); }
    if(!isNew && d.pow && d.pow.done){ setCheck('Pow', true); setVal('PowAt', d.pow.at); }
    (d.activities || []).forEach(function(name){
      var a = PSEAF_ACTIVITIES.filter(function(x){ return x.name === name; })[0];
      if(a){ setCheck('act_'+a.id, true); }
    });
    (d.kit || []).forEach(function(k, i){ setCheck('kit_'+i, k.on); });
    if(d.subAnswered){ setRadio('SubUsed', d.subUsed ? 'Yes' : 'No'); }
    if(d.loneAnswered){ setRadio('LoneUsed', d.loneUsed ? 'Yes' : 'No'); }
    if(d.lone){
      (d.lone.no || []).forEach(function(x, i){ setRadio('ln_'+i, x.a); });
      (d.lone.yes || []).forEach(function(x, i){ setRadio('ly_'+i, x.a); });
      (d.lone.night || []).forEach(function(x, i){ setRadio('lnt_'+i, x.a); });
    }
    setVal('NightJust', d.nightJust);
    fillRows('StaffRows', 'StaffName', 'Name', d.staff || []);
    var subs = (d.subSigned && d.subSigned.length) ? d.subSigned
             : (d.subNames || []).map(function(n){ return { name:n, contact:'', sig:'' }; });
    fillRows('SubRows', 'SubName', 'Subcontractor name / company', subs, true);
    if(typeof PSEAF_REVEAL_SYNC[P] === 'function'){ PSEAF_REVEAL_SYNC[P](); }
  }

  var REQ = ['ProjNo','Client','Pm','Folder','Desc','Site','Date','SiteRA','cOffice','cLocal','cEmerg','cClient'].map(function(s){ return P+s; });
  var LABELS = {};
  LABELS[P+'ProjNo'] = 'Project number'; LABELS[P+'Client'] = 'Client'; LABELS[P+'Pm'] = 'Project Manager';
  LABELS[P+'Folder'] = 'Project folder location on server'; LABELS[P+'Desc'] = 'Project description';
  LABELS[P+'Site'] = 'Site location'; LABELS[P+'Date'] = 'Assessment date';
  LABELS[P+'SiteRA'] = 'Site specific risk assessment';
  LABELS[P+'cOffice'] = 'Office contact'; LABELS[P+'cEmerg'] = 'Emergency contact / next of kin';
  LABELS[P+'cClient'] = 'Client representative'; LABELS[P+'cLocal'] = 'Local site emergency contact';

  function refresh(){
    var outstanding = [];
    reqCheckFields(REQ, LABELS).forEach(function(l){ outstanding.push(l); });
    var gates = pseafGateState(P);
    if(!gates.sub){  outstanding.push('Is a subcontractor being used?'); }
    if(!gates.lone){ outstanding.push('Is lone working required?'); }
    var subs = pseafSubState(P);
    if(!subs.ok){ outstanding.push(subs.named === 0 ? 'Record the subcontractor name and contact number' : 'Contact number missing for ' + (subs.named - subs.contacted) + ' of ' + subs.named + ' subcontractors'); }
    var subV = pseafSubVerifyState(P);
    if(!subV.ok){ outstanding.push(subV.ticked ? 'Subcontractor verification: name and date' : 'Confirm subcontractor RAMS and insurance reviewed and approved'); }
    var pow = pseafPowState(P);
    if(!pow.ok){ outstanding.push('Point of work check: name and date and time'); }
    var loneQ = pseafLoneState(P);
    if(!loneQ.ok){ outstanding.push('Lone working questions (' + loneQ.answered + ' of ' + loneQ.total + ' answered)'); }
    var night = pseafNightState(P);
    if(!night.ok){ outstanding.push('Night-time lone working justification'); }
    var staff = pseafStaffMessage(P);
    if(!staff.ok){
      outstanding.push(staff.named === 0
        ? 'Record at least one member of staff with contact details and a signature'
        : 'Contact details or signature missing for ' + Math.max(staff.named - staff.signed, staff.named - staff.contacted) + ' of ' + staff.named + ' staff');
    }
    reqRenderPanel('tplReqPanel', outstanding);
    var ok = outstanding.length === 0;
    btnDone.disabled = !ok;
    statusEl.textContent = ok ? 'Ready to complete the assessment.'
                              : outstanding.length + ' item' + (outstanding.length > 1 ? 's' : '') + ' still to complete.';
    statusEl.classList.toggle('ok', ok);
  }

  function openForm(){
    if(!built){
      buildPseafSections(document.getElementById('tplHost'), P, 1, true, {});
      PSEAF_SIG_HOOKS[P] = refresh;
      var latest = history.length ? history[history.length - 1].data : null;
      if(draft){ applyPrefill(draft, false); }
      else { applyPrefill(latest, true); }
      built = true;
    }
    recView.style.display = 'none';
    formView.style.display = 'block';
    refresh();
    window.scrollTo(0, 0);
  }
  function closeForm(){
    formView.style.display = 'none';
    recView.style.display = 'block';
    window.scrollTo(0, 0);
  }
  btnNew.addEventListener('click', openForm);
  document.getElementById('formBack').addEventListener('click', closeForm);
  var tplForm = document.getElementById('tplForm');
  tplForm.addEventListener('input', refresh);
  tplForm.addEventListener('change', refresh);

  /* Complete: add this assessment to the history and download ONE file,
     the next version of this PSEAF. */
  btnDone.addEventListener('click', function(){
    btnDone.disabled = true;
    try {
      var d = readPseaf(P);
      var entry = { version: history.length + 1, savedAt: new Date().toISOString(), data: d };
      var next = history.concat([entry]);
      var name = pseafTemplateFileName(d, entry.version);
      pseafSaveBlob(new Blob([pseafTemplateHtml(next, null)], { type:'text/html;charset=utf-8' }), name);
      history = next;
      draft = null;
      btnNew.textContent = 'Start a new assessment';
      /* A further assessment starts again from this one. */
      document.getElementById('tplHost').innerHTML = '';
      built = false;
      closeForm();
      fillSelect(history.length - 1);
      showRecord(history.length - 1, 'Version ' + entry.version + ' downloaded as ' + name
        + '. Save it to the project folder in place of the previous file.');
    } catch(err){
      console.error(err);
      statusEl.textContent = 'Could not create the new version. Please try again.';
      btnDone.disabled = false;
    }
  });

  /* Save progress: same version, with the unfinished answers kept. */
  btnSave.addEventListener('click', function(){
    var d = readPseaf(P);
    var name = pseafTemplateFileName(d, history.length || 1).replace(/\.html$/, '_in-progress.html');
    pseafSaveBlob(new Blob([pseafTemplateHtml(history, d)], { type:'text/html;charset=utf-8' }), name);
    statusEl.textContent = 'Progress saved as ' + name + '. Reopen that file to continue.';
    statusEl.classList.add('ok');
  });

  if(draft){ btnNew.textContent = 'Continue the assessment in progress'; }
  if(history.length){
    fillSelect(history.length - 1);
    showRecord(history.length - 1);
  } else {
    recSel.parentNode.style.display = 'none';
    openForm();
  }
}

/* Build the single PSEAF file, version 1, as a { name, blob } download. */
function pseafTemplateFile(d){
  const history = [{ version:1, savedAt:new Date().toISOString(), data:d }];
  const html = pseafTemplateHtml(history, null);
  return { name:pseafTemplateFileName(d, 1), blob:new Blob([html], { type:'text/html;charset=utf-8' }) };
}

/* =====================================================================
   FINGER SIGNATURE PAD
   Opens a signing panel (full screen on phones) so a signature can be
   written with a finger or stylus. Strokes are smoothed and the result is
   cropped to the ink and returned as a PNG data URI, the same format as an
   uploaded image. Serialised into the PSEAF file, so it works there too.
   ===================================================================== */
function pseafDrawSignature(onDone, signer){
  const ov = document.createElement('div');
  ov.className = 'sigpad-ov';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Sign with your finger');
  ov.innerHTML = '<div class="sigpad">'
    + '<div class="sigpad-head">'
    +   '<b>Sign with your finger</b>'
    +   (signer ? '<span class="sigpad-who"></span>' : '')
    +   '<span class="sigpad-tip">Turn your phone sideways for more room.</span>'
    + '</div>'
    + '<div class="sigpad-area">'
    +   '<canvas class="sigpad-cv" aria-label="Signature area"></canvas>'
    +   '<div class="sigpad-line" aria-hidden="true"><span>&times;</span></div>'
    +   '<div class="sigpad-ph" aria-hidden="true">Sign here</div>'
    + '</div>'
    + '<div class="sigpad-msg" aria-live="polite"></div>'
    + '<div class="sigpad-actions">'
    +   '<button type="button" class="btn-ghost" data-act="clear">Clear</button>'
    +   '<button type="button" class="btn-ghost" data-act="cancel">Cancel</button>'
    +   '<button type="button" class="btn" data-act="save" disabled>Use signature</button>'
    + '</div></div>';
  if(signer){ ov.querySelector('.sigpad-who').textContent = 'Signing as ' + signer; }
  document.body.appendChild(ov);
  document.body.classList.add('sigpad-open');

  const cv   = ov.querySelector('canvas');
  const ctx  = cv.getContext('2d');
  const msg  = ov.querySelector('.sigpad-msg');
  const save = ov.querySelector('[data-act="save"]');
  const ph   = ov.querySelector('.sigpad-ph');
  const INK  = '#0d1b3e';
  let drawn = false, active = null, pts = [];
  let strokes = [];   /* kept so the signature survives a resize or rotation */

  function setDrawn(v){
    drawn = v;
    save.disabled = !v;
    ph.style.display = v ? 'none' : '';
  }
  function style(){
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.fillStyle = INK;
  }
  function size(){
    const r = cv.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    cv.width  = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    style();
    redraw();
  }
  /* Strokes are stored as fractions of the pad size, so rotating the phone
     rescales the signature rather than losing it. */
  function redraw(){
    const r = cv.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    strokes.forEach(function(s){
      paint(s.map(function(p){ return { x:p.x * r.width, y:p.y * r.height, w:p.w }; }));
    });
  }
  /* Smooth line through the points using midpoint quadratic curves, with
     a slightly thinner line when the finger moves fast. */
  function paint(list){
    if(!list.length){ return; }
    if(list.length === 1){
      ctx.beginPath(); ctx.arc(list[0].x, list[0].y, 1.3, 0, Math.PI * 2); ctx.fill();
      return;
    }
    for(let i = 1; i < list.length; i++){
      const a = list[i - 1], b = list[i];
      const prev = list[i - 2] || a;
      ctx.lineWidth = b.w;
      ctx.beginPath();
      ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
      ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.stroke();
    }
  }
  function point(e){
    const r = cv.getBoundingClientRect();
    return { x:e.clientX - r.left, y:e.clientY - r.top, t:e.timeStamp || Date.now() };
  }
  function widthFor(p, q){
    if(!q){ return 2.6; }
    const v = Math.hypot(p.x - q.x, p.y - q.y) / Math.max(1, p.t - q.t);
    return Math.max(1.6, Math.min(3.2, 3.2 - v * 0.9));
  }

  cv.addEventListener('pointerdown', function(e){
    if(active !== null){ return; }        /* ignore a second finger */
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch(err){}
    active = e.pointerId;
    const p = point(e); p.w = 2.6;
    pts = [p];
    paint(pts);
    msg.textContent = '';
    setDrawn(true);
  });
  cv.addEventListener('pointermove', function(e){
    if(e.pointerId !== active){ return; }
    e.preventDefault();
    const events = (typeof e.getCoalescedEvents === 'function' && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    events.forEach(function(ev){
      const p = point(ev);
      const q = pts[pts.length - 1];
      if(q && Math.hypot(p.x - q.x, p.y - q.y) < 0.8){ return; }
      p.w = q ? (q.w * 0.6 + widthFor(p, q) * 0.4) : 2.6;
      pts.push(p);
      paint(pts.slice(-3));
    });
  });
  function end(e){
    if(e.pointerId !== active){ return; }
    active = null;
    const r = cv.getBoundingClientRect();
    if(pts.length){
      strokes.push(pts.map(function(p){ return { x:p.x / r.width, y:p.y / r.height, w:p.w }; }));
    }
    pts = [];
  }
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  /* Stop the page scrolling or zooming behind the pad on older iOS. */
  cv.addEventListener('touchstart', function(e){ e.preventDefault(); }, { passive:false });
  cv.addEventListener('touchmove',  function(e){ e.preventDefault(); }, { passive:false });

  size();
  window.addEventListener('resize', size);

  function close(){
    window.removeEventListener('resize', size);
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('sigpad-open');
    ov.remove();
  }
  function onKey(e){ if(e.key === 'Escape'){ close(); } }
  document.addEventListener('keydown', onKey);

  /* Crop to the inked area and cap the size, matching the upload route. */
  function trimmed(){
    const w = cv.width, h = cv.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for(let y = 0; y < h; y++){
      for(let x = 0; x < w; x++){
        if(data[(y * w + x) * 4 + 3] > 10){
          if(x < x0){ x0 = x; } if(x > x1){ x1 = x; }
          if(y < y0){ y0 = y; } if(y > y1){ y1 = y; }
        }
      }
    }
    if(x1 < 0){ return { url:'', w:0 }; }
    const dpr = cv.width / Math.max(1, cv.getBoundingClientRect().width);
    const inkW = (x1 - x0) / dpr, inkH = (y1 - y0) / dpr;
    const pad = Math.round(6 * dpr);
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
    x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    const scale = Math.min(420 / cw, 150 / ch, 1);
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(cw * scale));
    out.height = Math.max(1, Math.round(ch * scale));
    out.getContext('2d').drawImage(cv, x0, y0, cw, ch, 0, 0, out.width, out.height);
    return { url:out.toDataURL('image/png'), w:Math.max(inkW, inkH) };
  }

  ov.addEventListener('click', function(e){
    const b = e.target.closest('[data-act]');
    if(!b){ return; }
    const act = b.getAttribute('data-act');
    if(act === 'clear'){
      strokes = []; pts = [];
      const r = cv.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      msg.textContent = '';
      setDrawn(false);
    } else if(act === 'cancel'){
      close();
    } else if(act === 'save'){
      if(!drawn){ return; }
      const res = trimmed();
      if(!res.url || res.w < 30){
        msg.textContent = 'That is too small to be a signature. Please sign across the box.';
        return;
      }
      close();
      onDone(res.url);
    }
  });
}


/* =====================================================================
   COMPLETED PSEAF RECORD
   A static, read-only HTML file: the completed form with signatures
   embedded. It contains no code and blocks all scripts and network
   access through its own content security policy.
   ===================================================================== */
function pseafRecordFileName(d){
  function clean(s, fallback){
    const t = String(s || '').trim().replace(/[\\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().replace(/ /g, '-');
    return t ? t.slice(0, 60) : fallback;
  }
  const date = String(d.date || '').replace(/[^0-9\-]/g, '') || new Date().toISOString().slice(0,10);
  return clean(d.projNo, 'Project') + '_' + clean(d.desc, 'PSEAF') + '_PSEAF_' + date + '.html';
}
function pseafRecordHtml(d){
  const css = ':root{--line:#e6e6e6;--shadow:0 2px 10px rgba(0,0,0,.13);}'
    + 'html,body{margin:0;padding:0;background:#eef0f3;}'
    + '.printhint{max-width:794px;margin:12px auto;padding:0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#58595B;}'
    + pseafRecordCss()
    + '@media print{.printhint{display:none;}}'
    + '@media(max-width:600px){#pseafStage .pdfpage{padding:16px 12px;}#pseafStage table.meta td.k{width:120px;}}';
  return '<!DOCTYPE html>\n<html lang="en-GB">\n<head>\n<meta charset="UTF-8">\n'
    + '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<title>PSEAF ' + escapeHtml(d.projNo || '') + ' ' + escapeHtml(d.desc || '') + ' | AWN Consulting</title>\n'
    + '<style>' + css + '</style>\n</head>\n<body>\n'
    + '<div class="printhint">Completed PSEAF, created with the AWN PSEAF Field App. To print or keep a PDF copy, use Print and choose Save as PDF.</div>\n'
    + '<div id="recView"><div id="pseafStage">' + pseafPdfHtml(d) + '</div></div>\n'
    + '</body>\n</html>';
}

/* =====================================================================
   PSEAF FIELD APP
   Standalone PSEAF for phones and tablets. Works offline once installed.
   - New PSEAF, or continue an existing PSEAF file (adds the next version)
   - Answers are kept on this device as you go, so nothing is lost if the
     app is closed or the phone locks
   - The completed PSEAF is one HTML file that can be shared to email,
     Box, OneDrive or Teams through the phone's share sheet, or saved
   No data leaves the device unless the user chooses to share it.
   ===================================================================== */
(function(){
  const P = 'ps';
  const DRAFT_KEY = 'awn-pseaf-draft-v1';
  const LAST_KEY  = 'awn-pseaf-last-v1';

  const startView = document.getElementById('startView');
  const formView  = document.getElementById('viewPseaf');
  const psForm    = document.getElementById('pseafForm');
  const psSubmit  = document.getElementById('psSubmitBtn');
  const psStatus  = document.getElementById('psStatus');
  const sharePanel = document.getElementById('sharePanel');
  const shareMsg   = document.getElementById('shareMsg');
  const btnShare   = document.getElementById('btnShare');
  const btnSave    = document.getElementById('btnSaveFile');
  const formIntro  = document.getElementById('formIntro');

  let built = false;
  let lastFile = null;    /* { name, html } */
  let saveTimer = null;
  let suspendSave = false;
  let completed = false;   /* stops autosave re-creating a draft after completion */

  /* ---------------- storage helpers ---------------- */
  function store(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch(err){ console.warn('Could not save on this device', err); return false; }
  }
  function load(key){
    try { const t = localStorage.getItem(key); return t ? JSON.parse(t) : null; }
    catch(err){ return null; }
  }
  function drop(key){ try { localStorage.removeItem(key); } catch(err){} }

  function fmt(iso){
    const dt = new Date(iso);
    if(isNaN(dt.getTime())){ return ''; }
    return dt.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
  const SIG_RE = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/;

  /* ---------------- form build and prefill ---------------- */
  function ensureForm(){
    if(built){ return; }
    buildPseafSections(document.getElementById('psPseafHost'), P, 1, true);
    wireGps();
    PSEAF_SIG_HOOKS[P] = function(){ psCheck(); queueSave(); };
    built = true;
  }
  function resetForm(){
    completed = false;
    clearTimeout(saveTimer);
    document.getElementById('psPseafHost').innerHTML = '';
    built = false;
    ensureForm();
  }

  function setVal(id, v){ const e = document.getElementById(P+id); if(e && v !== undefined && v !== null){ e.value = v; } }
  function setRadio(name, v){ if(!v){ return; } const r = document.querySelector('input[name="'+P+name+'"][value="'+v+'"]'); if(r){ r.checked = true; } }
  function setCheck(id, on){ const e = document.getElementById(P+id); if(e){ e.checked = !!on; } }

  function fillRows(container, cls, placeholder, rows, noSig){
    const host = document.getElementById(P+container);
    if(!host){ return; }
    host.innerHTML = '';
    const add = PSEAF_ADD_ROW[P];
    const list = rows.length ? rows : [{ name:'', contact:'', sig:'' }];
    list.forEach(function(r){
      add(P+container, P+cls, placeholder, noSig);
      const row = host.lastElementChild;
      if(!row){ return; }
      const nameEl = row.querySelector('.'+P+cls);
      if(nameEl){ nameEl.value = r.name || ''; }
      const conEl = row.querySelector('.'+P+cls.replace(/Name$/, 'Contact'));
      if(conEl){ conEl.value = r.contact || ''; }
      if(r.sig && SIG_RE.test(r.sig)){
        row.dataset.sig = r.sig;
        const img = row.querySelector('.pseaf-sigimg');
        if(img){ img.src = r.sig; }
        row.classList.add('has-sig');
        const cta = row.querySelector('.pseaf-sigcta');
        if(cta){ cta.textContent = 'or upload an image'; }
      }
    });
  }

  /* isNew: a further assessment starts with today's date and a blank
     Point of Work Check, which must always be completed afresh. */
  function applyPrefill(d, isNew){
    d = d || {};
    const c = d.contacts || {};
    suspendSave = true;
    setVal('ProjNo', d.projNo); setVal('Pm', d.pm);
    setVal('Desc', d.desc); setVal('Site', d.site);
    setVal('Date', isNew ? new Date().toISOString().slice(0,10) : d.date);
    setVal('SiteRA', d.siteRA); setVal('KitOther', d.kitOther);
    setVal('SpecProc', d.specProc === '(none)' ? '' : d.specProc);
    setVal('SpecRA',   d.specRA   === '(none)' ? '' : d.specRA);
    setVal('cOffice', c.office);
    setVal('cEmerg',  c.emerg === '(not given)' ? '' : c.emerg);
    setVal('cClient', c.client);
    setVal('cLocal',  c.local === '(not given)' ? '' : c.local);
    if(d.subVerify){ setCheck('SubVerify', d.subVerify.done); setVal('SubVerifyBy', d.subVerify.by); setVal('SubVerifyDate', d.subVerify.date); }
    if(!isNew && d.pow && d.pow.done){ setCheck('Pow', true); setVal('PowAt', d.pow.at); }
    (d.activities || []).forEach(function(name){
      const a = PSEAF_ACTIVITIES.filter(function(x){ return x.name === name; })[0];
      if(a){ setCheck('act_'+a.id, true); }
    });
    (d.kit || []).forEach(function(k, i){ setCheck('kit_'+i, k.on); });
    if(d.subAnswered){ setRadio('SubUsed', d.subUsed ? 'Yes' : 'No'); }
    if(d.loneAnswered){ setRadio('LoneUsed', d.loneUsed ? 'Yes' : 'No'); }
    if(d.lone){
      (d.lone.no || []).forEach(function(x, i){ setRadio('ln_'+i, x.a); });
      (d.lone.yes || []).forEach(function(x, i){ setRadio('ly_'+i, x.a); });
      (d.lone.night || []).forEach(function(x, i){ setRadio('lnt_'+i, x.a); });
    }
    setVal('NightJust', d.nightJust);
    fillRows('StaffRows', 'StaffName', 'Name', d.staff || []);
    const subs = (d.subSigned && d.subSigned.length) ? d.subSigned
               : (d.subNames || []).map(function(n){ return { name:n, contact:'', sig:'' }; });
    fillRows('SubRows', 'SubName', 'Subcontractor name / company', subs, true);
    if(typeof PSEAF_REVEAL_SYNC[P] === 'function'){ PSEAF_REVEAL_SYNC[P](); }
    suspendSave = false;
  }

  /* ---------------- your name ----------------
     Remembered on this device so it is filled in next time. */
  const USER_KEY = 'awn-pseaf-user';
  function rememberUser(n){ if(n){ store(USER_KEY, n); } }
  function prefillUser(){
    const n = load(USER_KEY);
    const el = document.getElementById(P+'Pm');
    if(n && el && !el.value){ el.value = n; }
    const first = document.querySelector('#'+P+'StaffRows .'+P+'StaffName');
    if(n && first && !first.value){ first.value = n; }
  }

  /* ---------------- site location from the phone GPS ----------------
     Uses the phone's location service, which works without mobile data.
     The coordinates are written into the site location field; nothing is
     sent anywhere. The user can edit the result. */
  function wireGps(){
    const btn = document.getElementById(P+'GpsBtn');
    const msg = document.getElementById(P+'GpsMsg');
    const site = document.getElementById(P+'Site');
    if(!btn || !site){ return; }
    if(!('geolocation' in navigator)){
      btn.hidden = true;
      return;
    }
    btn.addEventListener('click', function(){
      btn.disabled = true;
      msg.className = 'pwa-gps-msg';
      msg.textContent = 'Finding your location. This can take up to 30 seconds outdoors.';
      navigator.geolocation.getCurrentPosition(function(pos){
        const lat = pos.coords.latitude.toFixed(5);
        const lon = pos.coords.longitude.toFixed(5);
        const acc = Math.round(pos.coords.accuracy || 0);
        const gps = 'GPS ' + lat + ', ' + lon + (acc ? ' (accurate to ' + acc + ' m)' : '');
        const cur = site.value.replace(/\s*[;,]?\s*GPS -?\d+\.\d+, -?\d+\.\d+( \(accurate to \d+ m\))?/, '').trim();
        site.value = cur ? cur + '; ' + gps : gps;
        site.dispatchEvent(new Event('input', { bubbles:true }));
        msg.className = 'pwa-gps-msg ok';
        msg.textContent = 'Location added' + (acc > 100 ? '. Accuracy is low, so move into the open and try again if needed.' : '.') + ' You can add an address or Eircode as well.';
        btn.disabled = false;
      }, function(err){
        msg.className = 'pwa-gps-msg bad';
        msg.textContent = err && err.code === 1
          ? 'Location access is turned off for this app. On iPhone: Settings, Privacy & Security, Location Services, Safari Websites. On Android: allow location for Chrome. Or type the location instead.'
          : 'Could not get a GPS fix. Move into the open and try again, or type the location instead.';
        btn.disabled = false;
      }, { enableHighAccuracy:true, timeout:30000, maximumAge:60000 });
    });
  }

  /* ---------------- validation ---------------- */
  const PS_REQUIRED = ['psProjNo','psPm','psDesc','psSite','psDate','psSiteRA','pscOffice','pscLocal','pscEmerg','pscClient'];
  const PS_LABELS = {
    psProjNo:'Project number', psPm:'Your name', psDesc:'Project description',
    psSite:'Site location', psDate:'Assessment date', psSiteRA:'Site specific risk assessment',
    pscOffice:'Office contact', pscEmerg:'Emergency contact / next of kin',
    pscClient:'Client representative', pscLocal:'Local site emergency contact'
  };
  function psCheck(){
    if(!built){ return; }
    const outstanding = [];
    reqCheckFields(PS_REQUIRED, PS_LABELS).forEach(function(l){ outstanding.push(l); });
    const gates = pseafGateState(P);
    if(!gates.sub){  outstanding.push('Is a subcontractor being used?'); }
    if(!gates.lone){ outstanding.push('Is lone working required?'); }
    const subs = pseafSubState(P);
    if(!subs.ok){
      outstanding.push(subs.named === 0 ? 'Record the subcontractor name and contact number'
        : 'Contact number missing for ' + (subs.named - subs.contacted) + ' of ' + subs.named + ' subcontractors');
    }
    const subV = pseafSubVerifyState(P);
    if(!subV.ok){ outstanding.push(subV.ticked ? 'Subcontractor verification: name and date' : 'Confirm subcontractor RAMS and insurance reviewed and approved'); }
    const pow = pseafPowState(P);
    if(!pow.ok){ outstanding.push('Point of work check: your name and the date and time'); }
    const loneQ = pseafLoneState(P);
    if(!loneQ.ok){ outstanding.push('Lone working questions (' + loneQ.answered + ' of ' + loneQ.total + ' answered)'); }
    const night = pseafNightState(P);
    if(!night.ok){ outstanding.push('Night-time lone working justification'); }
    const staff = pseafStaffMessage(P);
    if(!staff.ok){
      outstanding.push(staff.named === 0
        ? 'Record at least one member of staff with contact details and a signature'
        : 'Contact details or signature missing for ' + Math.max(staff.named - staff.signed, staff.named - staff.contacted) + ' of ' + staff.named + ' staff');
    }
    reqRenderPanel('psReqPanel', outstanding);
    const ok = outstanding.length === 0;
    psSubmit.disabled = !ok;
    psStatus.textContent = ok ? 'Ready to complete the PSEAF.'
      : outstanding.length + ' item' + (outstanding.length > 1 ? 's' : '') + ' still to complete. See the list above.';
    psStatus.classList.toggle('ok', ok);
  }

  /* ---------------- draft autosave ---------------- */
  function saveDraft(){
    if(!built || suspendSave || completed || formView.hidden){ return; }
    let d;
    try { d = readPseaf(P); } catch(err){ return; }
    const ok = store(DRAFT_KEY, { savedAt:new Date().toISOString(), data:d });
    const el = document.getElementById('draftState');
    if(el){ el.textContent = ok ? 'Saved on this device ' + new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : 'Could not save on this device (storage full)'; }
  }
  function queueSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 600);
  }
  psForm.addEventListener('input',  function(){ psCheck(); queueSave(); });
  psForm.addEventListener('change', function(){ psCheck(); queueSave(); });
  document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden'){ saveDraft(); } });
  window.addEventListener('pagehide', saveDraft);

  /* ---------------- views ---------------- */
  const clView = document.getElementById('viewChangelog');
  let clReturn = null;
  function show(view){
    startView.hidden = view !== startView;
    formView.hidden  = view !== formView;
    clView.hidden    = view !== clView;
    window.scrollTo(0, 0);
  }
  function openForm(intro){
    sharePanel.style.display = 'none';
    formIntro.innerHTML = intro;
    show(formView);
    psCheck();
  }
  function refreshStart(){
    const draft = load(DRAFT_KEY);
    const note = document.getElementById('draftNote');
    if(draft && draft.data){
      const d = draft.data;
      document.getElementById('draftText').textContent =
        (d.projNo || 'Untitled project') + (d.desc ? ' - ' + d.desc : '') + ', last saved ' + fmt(draft.savedAt) + '.';
      note.hidden = false;
    } else {
      note.hidden = true;
    }
    const last = load(LAST_KEY);
    const lastBtn = document.getElementById('chooseLast');
    if(last && last.name && last.html){
      lastBtn.hidden = false;
      document.getElementById('lastName').textContent = last.name;
    } else {
      lastBtn.hidden = true;
    }
  }

  const INTRO_NEW = 'Complete each section below. Your answers are saved on this device as you go. '
    + 'When everything is complete, select <b>Complete PSEAF</b> to create the file, then share it to email, Box or OneDrive.';
  document.getElementById('chooseNew').addEventListener('click', function(){
    if(load(DRAFT_KEY) && !confirm('Start a new PSEAF? The assessment in progress on this device will be discarded.')){ return; }
    drop(DRAFT_KEY);
    resetForm();
    prefillUser();
    openForm(INTRO_NEW);
    saveDraft();
  });
  document.getElementById('draftResume').addEventListener('click', function(){
    const draft = load(DRAFT_KEY);
    if(!draft || !draft.data){ refreshStart(); return; }
    resetForm();
    applyPrefill(draft.data, false);
    openForm(INTRO_NEW);
  });
  document.getElementById('draftDiscard').addEventListener('click', function(){
    if(!confirm('Discard the assessment in progress? This cannot be undone.')){ return; }
    drop(DRAFT_KEY);
    refreshStart();
  });
  document.getElementById('backToStart').addEventListener('click', function(){
    saveDraft();
    refreshStart();
    show(startView);
  });

  /* ---------------- complete, share and save ---------------- */
  function fileObj(){
    if(!lastFile){ return null; }
    try { return new File([lastFile.html], lastFile.name, { type:'text/html' }); }
    catch(err){ return null; }
  }
  function canShareFile(){
    const f = fileObj();
    return !!(f && navigator.canShare && navigator.share && navigator.canShare({ files:[f] }));
  }
  function showShare(note){
    shareMsg.textContent = note;
    btnShare.hidden = !canShareFile();
    sharePanel.style.display = 'block';
    sharePanel.scrollIntoView({ behavior:'smooth', block:'start' });
  }
  async function doShare(){
    const f = fileObj();
    if(!f){ return; }
    try {
      await navigator.share({ files:[f], title:lastFile.name, text:'PSEAF: ' + lastFile.name });
      shareMsg.textContent = 'Shared. Make sure the file reaches the project folder.';
    } catch(err){
      if(err && err.name === 'AbortError'){ return; }
      console.error(err);
      shareMsg.textContent = 'Sharing is not available here. Use Save to device instead, then attach or upload the file.';
    }
  }
  function doSave(){
    if(!lastFile){ return; }
    pseafSaveBlob(new Blob([lastFile.html], { type:'text/html;charset=utf-8' }), lastFile.name);
  }
  btnShare.addEventListener('click', doShare);
  btnSave.addEventListener('click', doSave);
  document.getElementById('btnAnother').addEventListener('click', function(){
    sharePanel.style.display = 'none';
    refreshStart();
    show(startView);
  });

  document.getElementById('chooseLast').addEventListener('click', function(){
    const last = load(LAST_KEY);
    if(!last){ return; }
    lastFile = last;
    show(formView);
    formIntro.innerHTML = 'The last PSEAF completed on this device is ready to share or save again.';
    showShare(last.name + ' (completed ' + fmt(last.savedAt) + ')');
  });

  psForm.addEventListener('submit', function(e){
    e.preventDefault();
    psCheck();
    if(psSubmit.disabled){ return; }
    psSubmit.disabled = true;
    try {
      const d = readPseaf(P);
      const savedAt = new Date().toISOString();
      const name = pseafRecordFileName(d);
      const html = pseafRecordHtml(d);
      lastFile = { name:name, html:html, savedAt:savedAt };
      const kept = store(LAST_KEY, lastFile);
      completed = true;
      clearTimeout(saveTimer);
      drop(DRAFT_KEY);
      rememberUser(d.pm);
      psStatus.textContent = 'PSEAF completed.';
      psStatus.classList.add('ok');
      showShare(name + ' is ready. '
        + (canShareFile() ? 'Share it to email, Box, OneDrive or Teams, or save it to this device.' : 'Save it to this device, then attach or upload it.')
        + (kept ? '' : ' Note: it could not be kept on this device, so save or share it now.'));
    } catch(err){
      console.error(err);
      psStatus.textContent = 'Could not create the PSEAF file. Please try again.';
    }
    psSubmit.disabled = false;
  });

  /* ---------------- connectivity and install ---------------- */
  const pill = document.getElementById('netPill');
  function net(){
    const on = navigator.onLine;
    pill.textContent = on ? 'Online' : 'Offline: you can keep working';
    pill.classList.toggle('off', !on);
  }
  window.addEventListener('online', net);
  window.addEventListener('offline', net);
  net();

  let deferredInstall = null;
  const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferredInstall = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async function(){
    if(!deferredInstall){ return; }
    deferredInstall.prompt();
    try { await deferredInstall.userChoice; } catch(err){}
    deferredInstall = null;
    installBtn.hidden = true;
  });
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const iosHint = document.getElementById('iosHint');
  if(!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)){ iosHint.hidden = false; }

  /* ---------------- automatic updates ----------------
     The worker is checked for updates on every launch, whenever the app
     comes back to the foreground, and every 30 minutes while open. When a
     new release takes over, the app reloads itself, but never while the
     signing pad is open. Work in progress is saved first and reopened
     automatically after the reload, so nothing is lost. */
  const RESUME_FLAG = 'awn-pseaf-resume-after-update';
  const VER_KEY = 'awn-pseaf-version';
  let reloading = false;
  let pendingReload = false;

  function safeToReload(){ return !document.querySelector('.sigpad-ov'); }
  function doReload(){
    if(reloading){ return; }
    if(!safeToReload()){ pendingReload = true; return; }
    reloading = true;
    const inForm = !formView.hidden && sharePanel.style.display !== 'block';
    if(inForm){
      clearTimeout(saveTimer);
      saveDraft();
      try { sessionStorage.setItem(RESUME_FLAG, '1'); } catch(err){}
    }
    location.reload();
  }
  /* Retry a deferred reload once the signing pad closes. */
  new MutationObserver(function(){
    if(pendingReload && safeToReload()){ pendingReload = false; doReload(); }
  }).observe(document.body, { childList:true });

  function toast(text){
    const t = document.createElement('div');
    t.className = 'pwa-toast';
    t.setAttribute('role', 'status');
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('show'); }, 30);
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 400); }, 4000);
  }

  if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      /* First install: nothing to refresh. Later releases: reload. */
      if(hadController){ doReload(); }
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache:'none' }).then(function(reg){
      function check(){ if(navigator.onLine){ reg.update().catch(function(){}); } }
      document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible'){ check(); } });
      window.addEventListener('online', check);
      setInterval(check, 30 * 60 * 1000);
    }).catch(function(err){ console.warn('Offline support unavailable', err); });
  }

  /* Tell the user when a new version has arrived. */
  (function(){
    const now = APP_VERSION;
    let before = null;
    try { before = localStorage.getItem(VER_KEY); localStorage.setItem(VER_KEY, now); } catch(err){}
    if(before && before !== now){ setTimeout(function(){ toast('Updated to version ' + now); }, 400); }
  })();

  /* Change log: opened from the version number in the footer. */
  document.getElementById('versionLink').addEventListener('click', function(){
    if(!clView.hidden){ return; }
    if(!formView.hidden){ saveDraft(); }
    clReturn = formView.hidden ? startView : formView;
    show(clView);
  });
  document.getElementById('clBack').addEventListener('click', function(){
    if(clReturn === startView){ refreshStart(); }
    show(clReturn || startView);
  });

  refreshStart();
  show(startView);

  /* Reopen the assessment that was open before an automatic update. */
  let resume = false;
  try { resume = sessionStorage.getItem(RESUME_FLAG) === '1'; sessionStorage.removeItem(RESUME_FLAG); } catch(err){}
  if(resume && load(DRAFT_KEY)){ document.getElementById('draftResume').click(); }
})();
