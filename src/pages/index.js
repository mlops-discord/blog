import React from "react";
import {
  AboutSection,
  ArticlesSection,
  ContactSection,
  HeroSection,
  InterestsSection,
  Page,
  ProjectsSection,
  Seo,
} from "gatsby-theme-portfolio-minimal";
import {
  Header,
  Events
} from "../components";

export default function IndexPage() {
  return (
    <>
      <Seo title="MLOps" />
      <Page useSplashScreenAnimation>
        <HeroSection sectionId="hero" />
        <AboutSection sectionId="about" heading="About Our Community" />
        <ArticlesSection sectionId="articles" heading="Latest Articles" sources={['Blog']} />
        <Events />
        {/* <InterestsSection sectionId="details" heading="Details" /> */}
        {/* <ProjectsSection sectionId="features" heading="Built-in Features" /> */}
        {/* <ContactSection sectionId="github" heading="Issues?" /> */}
      </Page>
    </>
  );
}
