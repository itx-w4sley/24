import {Mail,MessageSquare} from 'lucide-react';import {StudioForm} from '@/components/StudioForms';
export const metadata={title:'Contact'};
export default function Contact(){return <><div className="page-heading"><div className="eyebrow">SAY HELLO / START A CONVERSATION</div><h1>Get in touch<span className="gradient-text">.</span></h1><p>Have a question or something you'd like to collaborate on? Drop a message below. For a formal project brief, use the commission form.</p></div><StudioForm kind="contact"/></>}
