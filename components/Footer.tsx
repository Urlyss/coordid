import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t fixed bottom-0 w-full bg-background z-50">
    <div className='container flex flex-col items-center justify-center gap-4 h-16 md:flex-row'>
        <p className='text-balance text-center text-sm leading-loose text-muted-foreground md:text-left'>
            {"Built by "}
            <a href="https://twitter.com/odusseuskamto" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">Urlyss</a>
            {". The source code is available on "}
            <a href="https://github.com/urlyss/coordid" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">GitHub</a>
        </p>
    </div>
    </footer>
  )
}

export default Footer