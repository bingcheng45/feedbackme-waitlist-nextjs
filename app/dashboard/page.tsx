import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectButton } from '@/components/dashboard/CreateProjectButton';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/');
  }

  // Fetch user's projects
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(projects.createdAt);

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-slate-300">Manage your feedback projects</p>
        </div>

        {/* Projects Section */}
        <div className="glass-morphism rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Your Projects</h2>
            <CreateProjectButton />
          </div>

          {userProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 mb-6">Create your first project to start collecting feedback</p>
              <CreateProjectButton variant="primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 