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

export function VerificationEmailTemplate({
  email,
  expiresIn,
  verificationUrl,
}: {
  email: string;
  expiresIn: string;
  verificationUrl: string;
}) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#10b981",
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
                Verify Your Email Address
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi there,</Text>
              <Text className="mb-4">
                We&apos;ve sent this verification email to {email}. Thank you
                for signing up for our record label dashboard. To complete your
                registration, please verify your email address by clicking the
                button below.
              </Text>
              <Text className="mb-6">
                This verification link will expire in {expiresIn}. If you did
                not create an account, you can safely ignore this email.
              </Text>
              <Button
                className="bg-brand px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={verificationUrl}
              >
                Verify Email
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Text className="text-sm text-gray-600 mt-2">
                {verificationUrl}
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

export default VerificationEmailTemplate;
