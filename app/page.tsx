app/page.tsx
Kopier
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Course = {
  id: string
  title: string
  description: string
  pass_threshold: number
  max_attempts: number
  estimated_minutes: number
  status: string
}

type Module = {
  id: string
  sort_order: number
  title: string
  step_type: string
  time_required_seconds: number | null
}

type Question = {
  id: string
  sort_order: number
  question_text: string
  options: { id: string; text: string }[]
  correct_option_id: string
  explanation: string
}

export default function Home() {
  const [view, setView] = useState<'organizer' | 'participant' | 'results'>('organizer')
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('courses').select('*').eq('status', 'published')
      if (c && c.length > 0) {
        setCourses(c)
        setSelectedCourse(c[0])
        const { data: m } = await supabase.from('course_modules').select('*').eq('course_id', c[0].id).order('sort_order')
        if (m) setModules(m)
        const quizIds = m?.filter(x => x.step_type === 'quiz').map(x => x.id) || []
        if (quizIds.length > 0) {
          const { data: q } = await supabase.from('quiz_questions').select('*').in('module_id', quizIds).order('sort_order')
          if (q) setQuestions(q)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const currentModule = modules[step] || null
  const moduleQuestions = currentModule ? questions.filter(q => q.module_id === currentModule.id) : []
  const allAnswered = moduleQuestions.every(q => answers[q.id])
  const score = submitted ? Math.round((Object.entries(answers).filter(([qid, ans]) => questions.find(q => q.id === qid)?.correct_option_id === ans).length / Math.max(questions.length, 1)) * 100) : 0
  const passed = score >= (selectedCourse?.pass_threshold || 70)

  if (loading) return (
    

      
Laster kurs...


    

  )

  return (
    

      

        Rubic E-læring
        

          {(['organizer','participant','results'] as const).map(v => (
             setView(v)} style={{padding:'6px 14px',borderRadius:8,border:'none',background:view===v?'rgba(255,255,255,0.25)':'transparent',color:'#fff',cursor:'pointer',fontSize:13}}>
              {v === 'organizer' ? 'Arrangør' : v === 'participant' ? 'Deltaker' : 'Resultater'}
            
          ))}
        

      


      


        {view === 'organizer' && selectedCourse && (
          

            

              

                

                  
{selectedCourse.title}

                  
{selectedCourse.description}


                

                {selectedCourse.status}
              

              

                {[['Beståttgrense', selectedCourse.pass_threshold + '%'], ['Maks forsøk', selectedCourse.max_attempts], ['Est. tid', selectedCourse.estimated_minutes + ' min'], ['Moduler', modules.length]].map(([l,v]) => (
                  

                    
{v}

                    
{l}

                  

                ))}
              

            

            

              
Kursmoduler

              {modules.map((m, i) => (
                

                  
{i+1}

                  
{m.title}

                  {m.step_type}
                

              ))}
            

          

        )}

        {view === 'participant' && selectedCourse && !submitted && (
          

            {step === 0 && currentModule === null ? (
              

                
{selectedCourse.title}

                
{selectedCourse.description}


                 setStep(0)} style={{background:'#534AB7',color:'#fff',border:'none',padding:'10px 24px',borderRadius:8,fontSize:14,cursor:'pointer'}}>Start kurs
              

            ) : currentModule ? (
              

                

                  Steg {step+1} av {modules.length}
                  {currentModule.step_type}
                

                

                  

                

                
{currentModule.title}

                {currentModule.step_type === 'content' && (
                  

                    

                      Innhold vises her
                    

                     setStep(s => Math.min(s+1, modules.length-1))} style={{background:'#534AB7',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:'pointer',float:'right'}}>Neste →
                  

                )}
                {currentModule.step_type === 'timed' && (
                  

                    
Les gjennom innholdet nøye.


                     setStep(s => Math.min(s+1, modules.length-1))} style={{background:'#534AB7',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:'pointer',float:'right'}}>Neste →
                  

                )}
                {currentModule.step_type === 'quiz' && (
                  

                    {moduleQuestions.map(q => (
                      

                        
{q.question_text}


                        {q.options.map(o => (
                          
 setAnswers(a => ({...a, [q.id]: o.id}))} style={{border:`1px solid ${answers[q.id]===o.id?'#534AB7':'#e5e5e5'}`,borderRadius:8,padding:'10px 14px',marginBottom:6,cursor:'pointer',fontSize:13,background:answers[q.id]===o.id?'#EEEDFE':'#fff',color:answers[q.id]===o.id?'#534AB7':'inherit'}}>
                            {o.text}
                          

                        ))}
                      

                    ))}
                    

                      {step < modules.length-1
                        ?  setStep(s => s+1)} disabled={!allAnswered} style={{background:allAnswered?'#534AB7':'#ccc',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:allAnswered?'pointer':'not-allowed'}}>Neste →
                        :  setSubmitted(true)} disabled={!allAnswered} style={{background:allAnswered?'#534AB7':'#ccc',color:'#fff',border:'none',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:allAnswered?'pointer':'not-allowed'}}>Lever svar
                      }
                    

                  

                )}
              

            ) : (
              

                
Klar til å starte!

                 setStep(0)} style={{background:'#534AB7',color:'#fff',border:'none',padding:'10px 24px',borderRadius:8,fontSize:14,cursor:'pointer'}}>Start
              

            )}
          

        )}

        {view === 'participant' && submitted && (
          

            
{passed ? '✓' : '✗'}

            
{passed ? 'Bestått!' : 'Ikke bestått'}

            
Resultat: {score}% — Grense: {selectedCourse?.pass_threshold}%


            {passed && 
Akkreditering frigjøres automatisk
}
             { setSubmitted(false); setStep(0); setAnswers({}) }} style={{background:'transparent',border:'1px solid #e5e5e5',padding:'8px 20px',borderRadius:8,fontSize:13,cursor:'pointer'}}>Prøv igjen
          

        )}

        {view === 'results' && (
          

            
Resultater — {selectedCourse?.title}

            

              {[['Moduler', modules.length],['Spørsmål', questions.length],['Beståttgrense', (selectedCourse?.pass_threshold||70)+'%']].map(([l,v]) => (
                

                  
{v}

                  
{l}

                

              ))}
            

            
Kursdata er lastet fra Supabase. Koble til course_attempts for å se deltagerresultater.


          

        )}
      

    

  )
}
