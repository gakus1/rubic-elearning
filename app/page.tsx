'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const e = React.createElement
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Home() {
  const [view, setView] = useState('organizer')
  const [modules, setModules] = useState([])
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: c } = await sb.from('courses').select('*').eq('status','published')
      if (c && c.length > 0) {
        setSelected(c[0])
        const { data: m } = await sb.from('course_modules').select('*').eq('course_id',c[0].id).order('sort_order')
        if (m) setModules(m)
        const ids = m?.filter((x: any) => x.step_type==='quiz').map((x: any) => x.id) || []
        if (ids.length > 0) {
          const { data: q } = await sb.from('quiz_questions').select('*').in('module_id',ids).order('sort_order')
          if (q) setQuestions(q)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const mod = modules[step] || null
  const mqs = mod ? questions.filter((q: any) => q.module_id === mod.id) : []
  const allDone = mqs.every((q: any) => answers[q.id])
  const correct = Object.entries(answers).filter(([qid,ans]) => questions.find((q: any) => q.id===qid)?.correct_option_id===ans).length
  const score = submitted ? Math.round((correct / Math.max(questions.length,1)) * 100) : 0
  const passed = score >= (selected?.pass_threshold || 70)

  if (loading) return e('div', {style:{padding:'2rem',textAlign:'center'}}, 'Laster kurs...')

  const purple = '#534AB7'
  const navBtn = (v: string, label: string) => e('button', {key:v, onClick:()=>setView(v), style:{padding:'6px 14px',borderRadius:8,border:'none',background:view===v?'rgba(255,255,255,0.25)':'transparent',color:'#fff',cursor:'pointer',fontSize:13}}, label)

  const nav = e('div', {style:{background:purple,padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}},
    e('span', {style:{color:'#fff',fontWeight:500,fontSize:18}}, 'Rubic E-læring'),
    e('div', {style:{display:'flex',gap:8}}, navBtn('organizer','Arrangør'), navBtn('participant','Deltaker'), navBtn('results','Resultater'))
  )

  const statCard = ([l,v]: any) => e('div', {key:String(l), style:{background:'#f8f8f8',borderRadius:8,padding:'10px 14px',textAlign:'center'}},
    e('div', {style:{fontSize:20,fontWeight:500}}, String(v)),
    e('div', {style:{fontSize:12,color:'#888',marginTop:2}}, String(l))
  )

  let content = null

  if (view==='organizer' && selected) {
    content = e('div', null,
      e('div', {style:{background:'#fff',borderRadius:12,border:'1px solid #e5e5e5',padding:'1.25rem',marginBottom:12}},
        e('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}},
          e('div', null,
            e('h2', {style:{fontSize:18,fontWeight:500,margin:0}}, selected.title),
            e('p', {style:{fontSize:13,color:'#888',margin:'4px 0 0'}}, selected.description)
          ),
          e('span', {style:{background:'#EAF3DE',color:'#27500A',fontSize:11,padding:'3px 10px',borderRadius:20}}, selected.status)
        ),
        e('div', {style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8}},
          ...[['Beståttgrense',selected.pass_threshold+'%'],['Maks forsøk',selected.max_attempts],['Est. tid',selected.estimated_minutes+' min'],['Moduler',modules.length]].map(statCard)
        )
      ),
      e('div', {style:{background:'#fff',borderRadius:12,border:'1px solid #e5e5e5',padding:'1.25rem'}},
        e('h3', {style:{fontSize:14,fontWeight:500,margin:'0 0 12px'}}, 'Kursmoduler'),
        ...modules.map((m: any, i: number) => e('div', {key:m.id, style:{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:isetStep(0), style:{background:purple,color:'#fff',border:'none',padding:'10px 24px',borderRadius:8,fontSize:14,cursor:'pointer'}}, 'Start kurs')
    )
  }

  if (view==='participant' && selected && !submitted && mod) {
    const progressPct = Math.round(((step+1)/modules.length)*100)
    const stepContent = (mod.step_type==='content'||mod.step_type==='timed')
      ? e('div', null,
          e('div', {style:{background:'#f8f8f8',borderRadius:8,padding:'1rem',marginBottom:12,fontSize:13,color:'#555'}}, 'Innhold vises her.'),
          e('div', {style:{textAlign:'right'}}, e('button', {onClick:()=>setStep(s=>Math.min(s+1,modules.length-1)), style:{background:purple,color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:'pointer'}}, 'Neste'))
        )
      : e('div', null,
          ...mqs.map((q: any) => e('div', {key:q.id, style:{marginBottom:16}},
            e('p', {style:{fontSize:14,fontWeight:500,marginBottom:8}}, q.question_text),
            ...q.options.map((o: any) => e('div', {key:o.id, onClick:()=>setAnswers((a: any)=>({...a,[q.id]:o.id})), style:{border:`1px solid ${answers[q.id]===o.id?purple:'#e5e5e5'}`,borderRadius:8,padding:'10px 14px',marginBottom:6,cursor:'pointer',fontSize:13,background:answers[q.id]===o.id?'#EEEDFE':'#fff',color:answers[q.id]===o.id?purple:'inherit'}}, o.text))
          )),
          e('div', {style:{textAlign:'right',marginTop:8}},
            stepsetStep(s=>s+1), disabled:!allDone, style:{background:allDone?purple:'#ccc',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:allDone?'pointer':'not-allowed'}}, 'Neste')
              : e('button', {onClick:()=>setSubmitted(true), disabled:!allDone, style:{background:allDone?purple:'#ccc',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:allDone?'pointer':'not-allowed'}}, 'Lever svar')
          )
        )
    content = e('div', {style:{background:'#fff',borderRadius:12,border:'1px solid #e5e5e5',padding:'1.25rem'}},
      e('div', {style:{display:'flex',justifyContent:'space-between',marginBottom:8}},
        e('span', {style:{fontSize:13,fontWeight:500}}, `Steg ${step+1} av ${modules.length}`),
        e('span', {style:{fontSize:11,padding:'2px 8px',borderRadius:20,background:'#EEEDFE',color:purple}}, mod.step_type)
      ),
      e('div', {style:{height:4,background:'#f0f0f0',borderRadius:2,marginBottom:16}},
        e('div', {style:{height:'100%',background:purple,borderRadius:2,width:`${progressPct}%`}})
      ),
      e('h3', {style:{fontSize:16,fontWeight:500,marginBottom:12}}, mod.title),
      stepContent
    )
  }

  if (view==='participant' && submitted) {
    content = e('div', {style:{background:'#fff',borderRadius:12,border:'1px solid #e5e5e5',padding:'2rem',textAlign:'center'}},
      e('div', {style:{fontSize:48,marginBottom:8}}, passed?'✓':'✗'),
      e('h2', {style:{fontSize:20,fontWeight:500,marginBottom:4}}, passed?'Bestått!':'Ikke bestått'),
      e('p', {style:{color:'#888',marginBottom:16}}, `Resultat: ${score}% — Grense: ${selected?.pass_threshold}%`),
      passed ? e('div', {style:{background:'#EAF3DE',borderRadius:8,padding:'12px',color:'#27500A',fontSize:13,marginBottom:16}}, 'Akkreditering frigjøres automatisk') : null,
      e('button', {onClick:()=>{setSubmitted(false);setStep(0);setAnswers({})}, style:{background:'transparent',border:'1px solid #e5e5e5',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:'pointer'}}, 'Prøv igjen')
    )
  }

  if (view==='results') {
    content = e('div', {style:{background:'#fff',borderRadius:12,border:'1px solid #e5e5e5',padding:'1.25rem'}},
      e('h2', {style:{fontSize:16,fontWeight:500,marginBottom:16}}, `Resultater — ${selected?.title}`),
      e('div', {style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8,marginBottom:16}},
        ...[['Moduler',modules.length],['Spørsmål',questions.length],['Beståttgrense',(selected?.pass_threshold||70)+'%']].map(statCard)
      ),
      e('p', {style:{fontSize:13,color:'#888'}}, 'Kursdata lastet fra Supabase.')
    )
  }

  return e('div', {style:{minHeight:'100vh',background:'#f5f5f5',fontFamily:'system-ui,sans-serif'}},
    nav,
    e('div', {style:{maxWidth:760,margin:'2rem auto',padding:'0 1rem'}}, content)
  )
}