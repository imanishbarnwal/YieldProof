import { Button } from "./Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./Card";
import { Badge } from "./Badge";
import { StatusBadge } from "./StatusBadge";
import { Input } from "./Input";
import { Skeleton } from "./Skeleton";

export function ThemeShowcase() {
    return (
        <div className="space-y-8 p-8">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-thin gradient-text">Professional Deep Blue Theme</h1>
                <p className="gradient-text-subtle text-thin text-lg">Clean, professional design with Poppins typography and gray-white gradients</p>
            </div>

            {/* Typography Showcase */}
            <Card className="glass-effect">
                <CardHeader>
                    <CardTitle className="gradient-text">Typography Styles</CardTitle>
                    <CardDescription>Gray and white gradient text with thin professional styling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-ultra-thin gradient-text">Ultra Thin Heading</h1>
                        <h2 className="text-3xl font-thin gradient-text">Thin Heading</h2>
                        <h3 className="text-2xl font-light gradient-text">Light Heading</h3>
                        <p className="text-lg gradient-text-subtle text-thin">Thin body text with subtle gradient</p>
                        <p className="text-base gradient-text-subtle text-light">Light body text</p>
                        <p className="text-sm gradient-text-subtle text-ultra-thin tracking-wide">Ultra thin small text with tracking</p>
                    </div>
                </CardContent>
            </Card>

            {/* Buttons */}
            <Card className="glass-effect">
                <CardHeader>
                    <CardTitle className="gradient-text">Button Variants</CardTitle>
                    <CardDescription>Transparent buttons with blue gradient borders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Button>Default (Transparent + Blue Border)</Button>
                        <Button variant="gradient">Gradient Text</Button>
                        <Button variant="solid">Solid Background</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="link">Link Style</Button>
                        <Button isLoading>Loading</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Status & Badges */}
            <Card className="professional-shadow">
                <CardHeader>
                    <CardTitle className="gradient-text">Status Indicators</CardTitle>
                    <CardDescription>Various status and badge components with thin styling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <StatusBadge status="verified" />
                        <StatusBadge status="attesting" />
                        <StatusBadge status="submitted" />
                        <StatusBadge status="flagged" />
                        <StatusBadge status="rejected" />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Form Elements */}
            <Card>
                <CardHeader>
                    <CardTitle className="gradient-text">Form Elements</CardTitle>
                    <CardDescription>Input fields with professional styling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="Enter your text here..." />
                    <Input type="email" placeholder="email@example.com" />
                    <Input disabled placeholder="Disabled input" />
                </CardContent>
            </Card>

            {/* Loading States */}
            <Card>
                <CardHeader>
                    <CardTitle className="gradient-text">Loading States</CardTitle>
                    <CardDescription>Skeleton loaders and loading indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Button isLoading>Loading Button</Button>
                </CardContent>
            </Card>

            {/* Gradient Examples */}
            <Card>
                <CardHeader>
                    <CardTitle className="gradient-text">Gradient Text Examples</CardTitle>
                    <CardDescription>Different gradient text styles available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <p className="text-2xl gradient-text font-thin">Main gradient text (white to gray)</p>
                        <p className="text-2xl gradient-text-primary font-light">Primary gradient text (blue)</p>
                        <p className="text-2xl gradient-text-subtle font-ultra-thin">Subtle gradient text (gray tones)</p>
                        <p className="text-lg text-thin gradient-text-subtle">Professional thin body text with subtle gradient</p>
                    </div>
                </CardContent>
            </Card>

            {/* Button Interaction Demo */}
            <Card>
                <CardHeader>
                    <CardTitle className="gradient-text">Interactive Button Demo</CardTitle>
                    <CardDescription>Hover over buttons to see the blue gradient border effects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button className="h-16">
                            <div className="text-center">
                                <div className="gradient-text-primary font-light">Transparent Button</div>
                                <div className="text-xs gradient-text-subtle">Blue gradient border</div>
                            </div>
                        </Button>
                        <Button variant="gradient" className="h-16">
                            <div className="text-center">
                                <div className="font-light">Gradient Text Button</div>
                                <div className="text-xs opacity-70">With blue border</div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}