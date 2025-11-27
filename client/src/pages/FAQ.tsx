import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";
import Footer from "@/components/Footer";

export default function FAQ() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/trailmatch-logo.png" alt="TrailMatch" className="h-10 w-10" />
              <span className="text-2xl font-bold text-foreground">TrailMatch</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-foreground hover:text-primary font-medium">
                Find Trips
              </Link>
              <Link href="/shops" className="text-foreground hover:text-primary font-medium">
                Shops
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/post-trip" className="text-foreground hover:text-primary font-medium">
                    Post Trip
                  </Link>
                  <Link href="/messages" className="text-foreground hover:text-primary font-medium">
                    Messages
                  </Link>
                  <Link href="/profile" className="text-foreground hover:text-primary font-medium">
                    My Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers to common questions about TrailMatch
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            {/* General Questions */}
            <Card>
              <CardHeader>
                <CardTitle>General Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="what-is">
                    <AccordionTrigger>What is TrailMatch?</AccordionTrigger>
                    <AccordionContent>
                      TrailMatch is a platform that connects off-road enthusiasts. You can find and join 
                      off-road trips, organize your own adventures, discover local shops, and connect 
                      with other riders in your area.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cost">
                    <AccordionTrigger>Is TrailMatch free to use?</AccordionTrigger>
                    <AccordionContent>
                      Yes! Creating an account, browsing trips, and joining adventures is completely free. 
                      We offer optional premium features for trip organizers who want additional visibility 
                      for their trips.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="who-can-join">
                    <AccordionTrigger>Who can use TrailMatch?</AccordionTrigger>
                    <AccordionContent>
                      TrailMatch is for anyone interested in off-roading, from beginners to experts. 
                      Whether you have a stock 4x4 or a fully built rock crawler, you'll find trips 
                      that match your skill level and vehicle capabilities.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Finding and Joining Trips */}
            <Card>
              <CardHeader>
                <CardTitle>Finding and Joining Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="find-trips">
                    <AccordionTrigger>How do I find trips near me?</AccordionTrigger>
                    <AccordionContent>
                      Use the location filter on the homepage to search for trips in your area. 
                      You can also browse all available trips and filter by difficulty level, 
                      vehicle requirements, and dates.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="join-trip">
                    <AccordionTrigger>How do I join a trip?</AccordionTrigger>
                    <AccordionContent>
                      Click on any trip to view details, then click "Request to Join". You'll need 
                      to select one of your vehicles and provide a message to the organizer. The 
                      trip organizer will review your request and either accept or decline it.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="requirements">
                    <AccordionTrigger>What do the trip requirements mean?</AccordionTrigger>
                    <AccordionContent>
                      Each trip lists requirements like difficulty level, minimum tire size, and 
                      required equipment (winch, lockers, etc.). Make sure your vehicle meets these 
                      requirements before requesting to join. Trip organizers set these to ensure 
                      everyone can safely complete the trail.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="private-trips">
                    <AccordionTrigger>What are private trips?</AccordionTrigger>
                    <AccordionContent>
                      Private trips don't appear in public listings. They can only be accessed via 
                      a special invite link. This is perfect for organizing trips with a specific 
                      group of friends or club members. You'll find the shareable link in your 
                      Profile page under "Organized by You".
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Organizing Trips */}
            <Card>
              <CardHeader>
                <CardTitle>Organizing Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="post-trip">
                    <AccordionTrigger>How do I organize a trip?</AccordionTrigger>
                    <AccordionContent>
                      Click "Post Trip" in the navigation menu. Fill out the trip details including 
                      location, dates, difficulty level, and requirements. You can make your trip 
                      public or private. Once posted, users can request to join and you'll review 
                      each request.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="manage-requests">
                    <AccordionTrigger>How do I manage join requests?</AccordionTrigger>
                    <AccordionContent>
                      Go to your Profile page to see all pending requests for your trips. You can 
                      review each participant's vehicle and message, then accept or decline their 
                      request. If declining, you can provide a reason that will be visible to the 
                      requester.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="edit-trip">
                    <AccordionTrigger>Can I edit or cancel a trip?</AccordionTrigger>
                    <AccordionContent>
                      Yes! Visit the trip detail page and click "Edit" to update trip information, 
                      or "Delete" to cancel the trip entirely. Be considerate of participants who 
                      have already been accepted when making changes.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="premium">
                    <AccordionTrigger>What are premium and featured trips?</AccordionTrigger>
                    <AccordionContent>
                      Premium and featured trips get priority placement on the homepage, appearing 
                      above free listings. Premium trips have a gold badge, featured trips have a 
                      star badge. Contact us for pricing and availability.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Messaging and Communication */}
            <Card>
              <CardHeader>
                <CardTitle>Messaging and Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="messaging">
                    <AccordionTrigger>How does messaging work?</AccordionTrigger>
                    <AccordionContent>
                      You can message trip organizers directly from any trip detail page by clicking 
                      "Message Organizer". All your conversations are accessible from the Messages 
                      page in the navigation menu. Messages update automatically every few seconds.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="notifications">
                    <AccordionTrigger>How do I know if I have new messages or requests?</AccordionTrigger>
                    <AccordionContent>
                      You'll see red notification badges on "Messages" and "My Profile" links in the 
                      navigation. The Messages badge shows unread message count, and the Profile badge 
                      shows pending trip requests (both as organizer and participant).
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Vehicles and Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicles and Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="add-vehicle">
                    <AccordionTrigger>How do I add my vehicle?</AccordionTrigger>
                    <AccordionContent>
                      Go to your Profile page and click "Add Vehicle". Enter your vehicle details 
                      including make, model, year, build level, tire size, and modifications. You 
                      can add multiple vehicles and choose which one to use when joining trips.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="build-level">
                    <AccordionTrigger>What do the build levels mean?</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Stock:</strong> Factory configuration with no modifications</li>
                        <li><strong>Mild:</strong> Basic upgrades like larger tires and minor lift</li>
                        <li><strong>Moderate:</strong> Significant modifications including suspension, armor, and recovery gear</li>
                        <li><strong>Heavy:</strong> Extensively modified with lockers, winch, and major upgrades</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Shops */}
            <Card>
              <CardHeader>
                <CardTitle>Shops Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="find-shops">
                    <AccordionTrigger>How do I find off-road shops?</AccordionTrigger>
                    <AccordionContent>
                      Visit the Shops page from the navigation menu. You can filter by shop category 
                      (mechanic, fabrication, parts, etc.) and search by state or city. Each shop 
                      listing includes contact information, services offered, and user reviews.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="add-shop">
                    <AccordionTrigger>Can I add a shop to the directory?</AccordionTrigger>
                    <AccordionContent>
                      Yes! If you're logged in, click "Add Shop" on the Shops page. Fill out the 
                      shop information including name, location, categories, and contact details. 
                      This helps build our community resource for off-road services.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Safety and Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Safety and Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="safety">
                    <AccordionTrigger>What safety precautions should I take?</AccordionTrigger>
                    <AccordionContent>
                      Always ensure your vehicle meets the trip requirements. Bring proper recovery 
                      gear, first aid kit, and communication devices. Let someone know your plans. 
                      Follow the trip organizer's instructions and never attempt obstacles beyond 
                      your skill level. Off-roading involves inherent risks - be prepared and be safe.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="liability">
                    <AccordionTrigger>Who is responsible if something goes wrong?</AccordionTrigger>
                    <AccordionContent>
                      TrailMatch is a platform for connecting enthusiasts. We are not responsible 
                      for the organization or execution of trips. Participants join trips at their 
                      own risk. Trip organizers should consider liability waivers and proper insurance. 
                      Always practice safe off-roading and follow local laws and regulations.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </Accordion>

          {/* Contact Card */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-4">
                If you can't find the answer you're looking for, feel free to reach out to us.
              </p>
              <Button asChild>
                <a href="mailto:trailmatchsite@gmail.com" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
