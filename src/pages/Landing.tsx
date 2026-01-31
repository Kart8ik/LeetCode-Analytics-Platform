import LoginNavbar from '@/components/LoginNavbar'
import HeroSection from '@/components/landing/HeroSection'
import FeatureSection from '@/components/landing/FeatureSection'
import FAQSection from '@/components/landing/FAQSection'
import Footer from '@/components/landing/Footer'
import GameOfLifeBackground from '@/components/landing/GameOfLifeBackground'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GameOfLifeBackground />
      
      <LoginNavbar />
      
      <main className="flex-1">
        <HeroSection />
        
        <FeatureSection
          image="Leaderboard image"
          title="Competitive Leaderboards"
          description="See how you rank against your peers. Track your progress with global and friends-only leaderboards. Filter by section, semester, or difficulty level. Watch your ranking improve as you solve more problems."
          imagePosition="left"
        />
        
        <FeatureSection
          image="Friends image"
          title="Learn with Friends"
          description="Add friends and compete together. Send friend requests, see each other's progress, and motivate each other to keep solving. DSA becomes more fun when you're not doing it alone."
          imagePosition="right"
        />
        
        <FeatureSection
          image="Prompt Image"
          title="AI-Powered Insights"
          description="Get personalized insights about your coding journey. Analyze your problem-solving patterns, identify weak areas, and get recommendations on what to practice next. Make data-driven decisions to improve your skills."
          imagePosition="left"
        />
        
        <FAQSection />
      </main>
      
      <Footer />
    </div>
  )
}
