import {CheckCircle2,Clock3,Code2,FlaskConical,PauseCircle} from 'lucide-react';
const STAGES={planning:['Planned',Clock3],in_development:['In development',Code2],testing:['Testing',FlaskConical],on_hold:['On hold',PauseCircle],completed:['Completed',CheckCircle2]};
export default function ProjectStage({stage}){const [label,Icon]=STAGES[stage]||STAGES.planning;return <span className={'project-stage stage-'+(STAGES[stage]?stage:'planning')}><Icon size={13}/>{label}</span>}
