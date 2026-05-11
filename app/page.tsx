'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [view, setView] = useState('organizer')
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('courses').select('*').eq('status', 'published')
      if (c && c.length > 0) {
        setCourses(c)
        setSelected(c[0])
        const { data: m } = await supabase.from('course_modules').select('*').eq('course_id', c[0].id).order('sort_order')
        if (m) setModules(m)
        const ids = m?.filter((x: any) => x.step_type === 'quiz').map((x: any) => x.id) || []
        if (ids.length > 0) {
          const { data: q } = await supabase.from('quiz_questions').select('*').in('module_id', ids).order('sort_order')
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
  const score = submitted ? Math.round((Object.entries(answers).filter(([qid, ans]) => questions.find((q: any) => q.id === qid)?.correct_option_id === ans).length / Math.max(questions.length, 1)) * 100) : 0
  const passed = score >= (selected?.pass_threshold || 70)

  const s = (obj: any) => Object.entries(obj).map(([k,v]) => `${k}:${v}`).join(';')

  if (loading) return 
Laster kurs...


  return (
    

      

        Rubic E-læring
        

          {['organizer','participant','results'].map(v => (
             setView(v)} style={{padding:'6px 14px',borderRadius:8,border:'none',background:view===v?'rgba(255,255,255,0.25)':'transparent',color:'#fff',cursor:'pointer',fontSize:13}}>
              {v==='organizer'?'Arrangør':v==='participant'?'Deltaker':'Resultater'}
            
          ))}
        

      


      


        {view==='organizer' && selected && (
          

            

              

                

                  
{selected.title}

                  

{selected.description}


                

                {selected.status}
              

              

                {[['Beståttgrense',selected.pass_threshold+'%'],['Maks forsøk',selected.max_attempts],['Est. tid',selected.estimated_minutes+' min'],['Moduler',modules.length]].map(([l,v]) => (
                  

                    
{String(v)}

                    
{String(l)}

                  

                ))}
              

            

            

              
Kursmoduler

              {modules.map((m: any, i: number) => (
                

                  
{i+1}

                  
{m.title}

                  {m.step_type}
                

              ))}
            

          

        )}

        {view==='participant' && selected && !submitted && mod && (
          

            

              Steg {step+1} av {modules.length}
              {mod.step_type}
            

            

              

            

            
{mod.title}

            {(mod.step_type==='content'||mod.step_type==='timed') && (
              

                
Innhold for dette steget vises her.

                

                   setStep(s => Math.min(s+1,modules.length-1))} style={{background:'#534AB7',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:'pointer'}}>Neste →
                

              

            )}
            {mod.step_type==='quiz' && (
              

                {mqs.map((q: any) => (
                  

                    

{q.question_text}


                    {q.options.map((o: any) => (
                      
 setAnswers((a: any) => ({...a,[q.id]:o.id}))} style={{border:`1px solid ${answers[q.id]===o.id?'#534AB7':'#e5e5e5'}`,borderRadius:8,padding:'10px 14px',marginBottom:6,cursor:'pointer',fontSize:13,background:answers[q.id]===o.id?'#EEEDFE':'#fff',color:answers[q.id]===o.id?'#534AB7':'inherit'}}>
                        {o.text}
                      

                    ))}
                  

                ))}
                

                  {step setStep(s => s+1)} disabled={!allDone} style={{background:allDone?'#534AB7':'#ccc',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:allDone?'pointer':'not-allowed'}}>Neste →
                    :  setSubmitted(true)} disabled={!allDone} style={{background:allDone?'#534AB7':'#ccc',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:allDone?'pointer':'not-allowed'}}>Lever svar
                  }
                

              

            )}
          

        )}

        {view==='participant' && selected && !submitted && !mod && (
          

            
{selected.title}

            

{selected.description}


             setStep(0)} style={{background:'#534AB7',color:'#fff',border:'none',padding:'10px 24px',borderRadius:8,fontSize:14,cursor:'pointer'}}>Start kurs
          

        )}

        {view==='participant' && submitted && (
          

            
{passed?'✓':'✗'}

            
{passed?'Bestått!':'Ikke bestått'}

            

Resultat: {score}% — Grense: {selected?.pass_threshold}%


            {passed && 
Akkreditering frigjøres automatisk
}
             {setSubmitted(false);setStep(0);setAnswers({})}} style={{background:'transparent',border:'1px solid #e5e5e5',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:'pointer'}}>Prøv igjen
          

        )}

        {view==='results' && (
          

            
Resultater — {selected?.title}

            

              {[['Moduler',modules.length],['Spørsmål',questions.length],['Beståttgrense',(selected?.pass_threshold||70)+'%']].map(([l,v]) => (
                

                  
{String(v)}

                  
{String(l)}

                

              ))}
            

            

Kursdata er lastet fra Supabase.


          

        )}
      

    

  )
}

