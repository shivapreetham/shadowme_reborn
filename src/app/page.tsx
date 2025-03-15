'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Sparkles, 
  MessageCircle, 
  Lock, 
  Users, 
  Bot, 
  School,
  UserCheck,
  MessagesSquare,
  Ghost
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import anonymousMessages from '@/app/(app)/(anonymous)/anonymousMessages.json';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gradient-to-b from-background via-secondary/5 to-background">
        {/* Hero Section */}
        <section className="text-center mb-16 space-y-8">
          <div className="relative inline-block">
          <h1 className="text-5xl md:text-7xl font-bold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
            ShatterBox
          </h1>
            <Sparkles className="absolute -right-8 -top-4 text-primary animate-bounce" />
          </div>
          
          <div className="space-y-3">
            <p className="text-2xl md:text-3xl text-foreground/90 font-medium">
              Exclusive Social Platform for NIT Jamshedpur
            </p>
            <p className="text-lg md:text-xl text-muted-foreground italic">
              "So whom do you really trust?"
            </p>
          </div>

          {/* Main CTA */}
          <div className="flex gap-6 justify-center mt-8">
            
            <Link href="/sign-in">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl">
              Join Now
            </Button>
          </Link>
            <Button 
              variant="outline" 
              className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/5 rounded-xl hover:border-primary/40 transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </section>

        {/* Bento Grid Features */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Verified Community */}
          <Card className="row-span-1 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <School className="text-primary h-6 w-6" />
                Verified Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">
                Exclusive to NIT Jamshedpur students. Every account is verified with institute credentials.
              </p>
            </CardContent>
          </Card>

          {/* Chat Features */}
          <Card className="row-span-2 col-span-1 md:col-span-2 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <MessagesSquare className="text-primary h-6 w-6" />
                Rich Chat Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Users className="text-primary w-8 h-8" />
                <h3 className="font-semibold text-lg">Group Chats</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create and join group conversations
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Ghost className="text-primary w-8 h-8" />
                <h3 className="font-semibold text-lg">Anonymous Mode</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Send messages without revealing identity
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="row-span-1 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Bot className="text-primary h-6 w-6" />
                AI Assistance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">
                Get help with making messages spicier and more engaging with our integrated AI assistant.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Message Carousel */}
        <div className="relative w-full max-w-lg md:max-w-xl mb-16">
          <Carousel
            plugins={[Autoplay({ delay: 3500 })]}
            className="w-full"
            opts={{
              align: "center",
              loop: true,
            }}
          >
            <CarouselContent>
              {anonymousMessages.map((message, index) => (
                <CarouselItem key={index} className="p-2">
                  <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-primary/150">
                        {message.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-start space-x-4">
                      <Mail className="flex-shrink-0 text-primary/70 mt-1 h-5 w-5" />
                      <div className="space-y-2">
                        <p className="text-foreground/80 leading-relaxed">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground/70 italic">
                          {message.received}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-12 mb-16">
          {[
            { icon: UserCheck, label: "Verified Users", value: "1000+" },
            { icon: MessageCircle, label: "Daily Messages", value: "500+" },
            { icon: Lock, label: "Secure Chats", value: "100%" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center group">
              <stat.icon className="w-10 h-10 text-primary/80 group-hover:text-primary mx-auto mb-3 transition-colors duration-300" />
              <p className="font-bold text-2xl text-foreground/90 mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>
      <div className="w-full max-w-4xl mx-auto px-4 mb-8">
       <p className="text-sm text-red-500/90 text-center font-medium border border-red-500/20 rounded-lg p-3 bg-red-500/5">
       ⚠️ Disclaimer: All anonymous messages are monitored. Any form of harassment, hate speech, or malicious content will result in immediate account termination and may lead to disciplinary action. Your anonymity does not protect you from consequences.
    </p>
      </div>
      <footer className="text-center p-8 bg-background/50 backdrop-blur-sm text-muted-foreground border-t border-primary/10">
        <p className="text-sm">
          © 2025 ShatterBox. All rights reserved.
        </p>
      </footer>
    </div>
  );
}