import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const faqs = [
  {
    id: 'leetcode-integration',
    question: 'How does LeetTrack connect to LeetCode for your data?',
    answer:
      'LeetTrack securely connects to your LeetCode account using your LeetCode username. We fetch your public profile data including problem statistics, submission history, and progress metrics. Your data is automatically synced and updated regularly to keep your dashboard and leaderboard rankings current. All data fetching happens securely through LeetCode\'s public API endpoints.',
  },
  {
    id: 'privacy-leaderboard',
    question: 'What privacy features are available in the leaderboard?',
    answer:
      'LeetTrack respects your privacy. You can control your visibility on the public leaderboard through privacy settings. You can choose to be visible to everyone, only to your friends, or remain completely private. When you\'re private, your stats won\'t appear on public leaderboards, but you can still see your own progress and compete with friends who have accepted your friend requests.',
  },
  {
    id: 'friends-feature',
    question: 'How does the friends feature work?',
    answer:
      'You can search for other users by username and send them friend requests. Once they accept, you\'ll be able to see each other on the friends-only leaderboard. This allows you to compete and compare progress with people you know, making your DSA journey more social and motivating. You can manage friend requests through the notification bell in the navigation bar.',
  },
  {
    id: 'data-sync',
    question: 'How often is my data synced?',
    answer:
      'Your LeetCode data is automatically synced when you first sign up, and then periodically updated. If you notice your stats are outdated, you can manually refresh from your dashboard. We\'re continuously working to make data syncing more seamless and real-time.',
  },
]

export default function FAQSection() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12 text-foreground">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" defaultValue="leetcode-integration" className="space-y-2">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
