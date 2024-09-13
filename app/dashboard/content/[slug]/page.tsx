"use client"
import React, { useState } from 'react'
import FormSection from '../(components)/FormSection'
import Output from '../(components)/Output'
import { TEMPLATE } from '../../(components)/TemplateSection'
import Templates from '@/app/(templates)/Templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { chatSession } from '@/utils/AIModal'
import { useUser } from '@clerk/nextjs'
import axios from 'axios';

interface SLUGPROPS {
  params: {
    'slug': string
  }
}

const ContentPage = (props: SLUGPROPS) => {


  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<string>();
  const { user } = useUser()

  const generateContent = async (formData: any) => {
    setLoading(true)
    const selectedPrompt = selectedTemplate?.aiPrompt
    const finalPrompt = JSON.stringify(formData) + "," + selectedPrompt
    const result = await chatSession.sendMessage(finalPrompt)
    const aiResponse = await result.response.text()
    // console.log(result.response.text())
    setResult(result.response.text())
    saveInDb(formData, selectedTemplate?.slug, aiResponse)
    setLoading(false)


  }
  const saveInDb = async (formData: any, slug: any, aiResponse: any) => {
    try {
      const response = await axios.post('/api/saveContent', {
        formData,
        slug,
        aiResponse,
        createdBy: user?.primaryEmailAddress?.emailAddress || '',
      });

      if (!response.data.success) {
        console.error('Error:', response.data.error);
      } else {
        console.log('Data saved:', response.data.data);
      }
    } catch (error) {
      console.error('Failed to save in DB:', error);
    }
  };





  const selectedTemplate: TEMPLATE | undefined = Templates?.find((item) => item.slug == props.params.slug)

  return (
    <div className='p-5'>
      <Link href={'/dashboard'}>
        <Button><ArrowLeft></ArrowLeft></Button>
      </Link>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-10 py-5'>
        <FormSection selectedTemplate={selectedTemplate} userFormInput={(e: any) => generateContent(e)} loading={loading} />
        <div className='col-span-2'>
          <Output result={result} />
        </div>
      </div>
    </div>
  )
}

export default ContentPage