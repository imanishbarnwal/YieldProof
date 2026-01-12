"use client"

import { Button } from "./Button"
import { Badge } from "./Badge"
import { Input } from "./Input"
import { Card, CardHeader, CardTitle, CardContent } from "./Card"
import { AnimatedSection, StaggeredContainer } from "./AnimatedSection"
import { 
  Download, 
  Heart, 
  Star, 
  Trash2, 
  Settings, 
  Plus,
  ArrowRight,
  Search,
  Mail,
  Lock
} from "lucide-react"

export function ButtonShowcase() {
  return (
    <div className="p-8 space-y-12 bg-gradient-to-br from-slate-950 to-slate-900 min-h-screen">
      <AnimatedSection className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Enhanced UI Components</h1>
        <p className="text-slate-400 text-lg">Modern, animated components with Framer Motion</p>
      </AnimatedSection>

      {/* Button Variants */}
      <AnimatedSection delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="default">
                <Download className="w-4 h-4 mr-2" />
                Default
              </Button>
              <Button variant="gradient">
                <Star className="w-4 h-4 mr-2" />
                Gradient
              </Button>
              <Button variant="success">
                <Heart className="w-4 h-4 mr-2" />
                Success
              </Button>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Destructive
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Outline
              </Button>
              <Button variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Secondary
              </Button>
              <Button variant="ghost">
                Ghost
              </Button>
              <Button variant="warning">
                Warning
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button size="sm" variant="gradient">
                Small Button
              </Button>
              <Button size="lg" variant="default">
                Large Button
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="xl" variant="success">
                Extra Large
                <Star className="w-6 h-6 ml-2" />
              </Button>
            </div>

            <div className="flex gap-4">
              <Button isLoading variant="gradient">
                Loading...
              </Button>
              <Button disabled variant="outline">
                Disabled
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Badge Variants */}
      <AnimatedSection delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="success" pulse>Live Status</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="info">Information</Badge>
              <Badge variant="purple">Premium</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Input Variants */}
      <AnimatedSection delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Email Address"
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
              />
              <Input 
                label="Password"
                type="password"
                placeholder="Enter password"
                icon={<Lock className="w-4 h-4" />}
              />
            </div>
            <Input 
              label="Search"
              placeholder="Search for anything..."
              icon={<Search className="w-4 h-4" />}
            />
            <Input 
              label="Error Example"
              placeholder="This field has an error"
              error="This field is required"
            />
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Animated Cards */}
      <AnimatedSection delay={0.4}>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Animated Card Grid</h2>
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Star className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle>Premium Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Access advanced analytics and priority support with our premium plan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Settings className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle>Easy Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Set up your workspace in minutes with our intuitive configuration tools.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Built with love by developers, for developers. Join our growing community.
                </p>
              </CardContent>
            </Card>
          </StaggeredContainer>
        </div>
      </AnimatedSection>
    </div>
  )
}