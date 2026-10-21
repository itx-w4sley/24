export const dynamic='force-dynamic';
import ProjectGrid from '@/components/ProjectGrid';import {publicItems} from '@/lib/content';
export const metadata={title:'Portfolio'};
export default async function Portfolio(){const projects=await publicItems('projects',{limit:500});return <><section className="page-heading reveal"><span className="eyebrow">PROJECT EXPLORER / THE ARCHIVE</span><h1>All work<span className="gradient-text">.</span></h1><p>Browse selected banners, logos, posters, photography and digital experiences. Search, filter, save favourites and open each artwork in the full-screen inspector.</p></section><ProjectGrid items={projects}/></>}
