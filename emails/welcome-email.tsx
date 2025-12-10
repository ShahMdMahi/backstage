import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";

export function WelcomeEmailTemplate({
  name,
  email,
  dashboardUrl,
}: {
  name: string;
  email: string;
  dashboardUrl: string;
}) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#3b82f6",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
            <Section className="bg-brand text-white text-center py-8">
              <Text className="text-2xl font-bold">
                Welcome to Our Record Label Dashboard!
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi {name},</Text>
              <Text className="mb-4">
                We&apos;ve sent this welcome email to {email}. Thank you for
                joining our record label dashboard! We&apos;re excited to have
                you on board.
              </Text>
              <Text className="mb-6">
                Your account is now active, and you can start managing your
                music, tracks, and analytics right away.
              </Text>
              <Button
                className="bg-brand px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={dashboardUrl}
              >
                Get Started
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If you have any questions, please don&apos;t hesitate to reach
                out to our support team.
              </Text>
              <Text className="text-sm text-gray-600 mt-4">
                Best regards,
                <br />
                The Record Label Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default WelcomeEmailTemplate;
