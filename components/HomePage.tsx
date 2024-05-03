'use client'
import React from 'react'
import { Button } from './ui/button'

const HomePage = () => {
  return (
    <div className="p-6 space-y-10"> 
    <section className="h-[50dvh] grid grid-cols-2">
      <div className="col-span-1 space-y-4">
      <h1 className="text-5xl">Empowering Africa, One ID at a Time</h1>
      <h2 className="text-xl leading-relaxed">
        {`CoordID is Africa's official digital property addressing system which
        covers every inch of the continent and ensures that all locations are
        addressed. With CoordID, every location has a unique digital address.`}
      </h2>
      </div>
      <div className="col-span-1 flex justify-center items-center">
        <Button size={"lg"}>Start Now</Button>
      </div>
    </section>
    <section className='space-y-4'>
    <h1 className="text-3xl">The Identity Crisis in Africa</h1>
      <h2 className="text-xl leading-relaxed">
        {`In many African countries, the lack of a comprehensive postal code
        system has created significant challenges for individuals and
        businesses. Without a reliable way to identify and locate addresses,
        people face difficulties in applying for jobs, accessing online
        services, and receiving important packages and deliveries. This lack
        of a unique identification system has hindered economic and social
        progress, limiting opportunities and creating frustration for millions
        of Africans. It's time to address this problem and empower people to
        take control of their futures.`}
      </h2>
    </section>
    <section className='space-y-4'>
      <h1 className="text-3xl">Introducing CoordID: Your Key to a Unique ID</h1>
      <h2 className="text-xl leading-relaxed">
        {`Introducing our innovative application that provides a unique ID
        solution for people in African countries. By using our platform, you
        can obtain a personalized ID that will unlock a world of
        possibilities. With your unique ID, you'll be able to:`}
        <ul>
          <li>
            Apply for jobs with ease, showcasing your identity and
            qualifications
          </li>
          <li>
            Access online services, government programs, and financial
            institutions with confidence
          </li>
          <li>
            Receive packages and deliveries without the hassle of unclear
            addresses
          </li>
          <li>
            Establish a secure and recognized form of personal identification
          </li>
          <li>
            Our application is designed to be user-friendly and accessible,
            empowering you to take control of your future and unlock your full
            potential.
          </li>
        </ul>
      </h2>
    </section>
    <section className='space-y-4'>
      <h1 className="text-3xl">Unlock the Power of a Unique ID</h1>
      <h2 className="text-xl leading-relaxed">
        {`Don't let the lack of a postal code system hold you back. Register for your unique ID today and unlock a world of opportunities.`}</h2>
      <div className="flex justify-center items-center">
        <Button size={"lg"}>Start Now</Button>
      </div>
    </section>
  </div>
  )
}

export default HomePage