import React from "react"
import Link from "gatsby-link"

import presets, { colors } from "../utils/presets"
import { rhythm, scale, options } from "../utils/typography"
import { JSIcon, WebpackIcon, ReactJSIcon, GraphQLIcon } from "../assets/logos"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"
import Container from "../components/container"
import MastheadContent from "../components/masthead"
import MastheadBg from "../components/masthead-bg"
import UsedBy from "../components/used-by"
import Cards from "../components/cards"
import Card from "../components/card"
import CardHeadline from "../components/card-headline"
import Diagram from "../components/diagram"
import BlogPostPreviewItem from "../components/blog-post-preview-item"
import FuturaParagraph from "../components/futura-paragraph"
import CtaButton from "../components/cta-button"
import TechWithIcon from "../components/tech-with-icon"

class IndexRoute extends React.Component {
  render() {
    const blogPosts = this.props.data.allMarkdownRemark
    return (
      <div css={{ position: `relative` }}>
        <MastheadBg />
        <div
          css={{
            font: 'Futura',
            display: `flex`,
            flexDirection: `row`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
          }}
        >
          <MastheadContent />
          <UsedBy />
          <div
            css={{
              padding: rhythm(presets.gutters.default / 2),
              flex: `0 0 100%`,
              [presets.Hd]: {
                padding: vP,
                paddingTop: 0,
              },
            }}
          >
            <Cards>
              <Card>
                <CardHeadline>
                  Modern cobots without the large price
                </CardHeadline>
                <FuturaParagraph>
                  Enjoy the power of the latest colobrative robots–{` `}
                  <TechWithIcon icon={ReactJSIcon}>AI Vision</TechWithIcon>,{` `}
                  <TechWithIcon icon={WebpackIcon}>Mobility</TechWithIcon>,{` `}
                  easy to train and fast deployment — all setup and waiting for
                  you to start automating.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Leading Artificial Intelligence</CardHeadline>
                <FuturaParagraph>
                  Nikola Robotics come with powerfull on board Cameras & Machine-Learning processors. 
                  Add crucial IOT sensors for your automation needs — from one or many jobs: Quickly deploy software with 1 push {` `}
                  <TechWithIcon icon={GraphQLIcon}> </TechWithIcon>.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Scale to the whole factory</CardHeadline>
                <FuturaParagraph>
                  Nikola's cobots are ready for your factory scale. Forget complicated solutions with
                  multiple 3rd party vendors and incompatibile immobile systems. Nikola Robotics is competive, fast setup
                  costs, low maintenance, and multi-scilled scaling. 
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Get the most out of your company</CardHeadline>
                <FuturaParagraph>
                  Get the maximum out of your employees. The future of
                  production line is to utilize your creative works on non-repative task— {` `}
                  <a href="http://niko.la/">NIKOLA LABS</a>. Let the robots handel the highly repative, mudane and risky jobs in your factory.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>
                  <em css={{ color: colors.gatsby, fontStyle: `normal` }}>
                    Static
                  </em>
                  {` `}
                  Future-Proof your automation
                </CardHeadline>
                <FuturaParagraph>
                  Nikola Robotics is a partner who is there for your every automation need.
                  Let us provide you support on setting up, maintaining, upgrading your production.
                  Our stress free support will alow you to focus on your core skillset and not worry about needing to hire robotics support.
                </FuturaParagraph>
              </Card>
              <Card>
                <CardHeadline>Speed past the competition</CardHeadline>
                <FuturaParagraph>
                  Nikola Robotics builts turn-key end-to-end collobrative robotics with industry leading Big Data.  Get the most up to date 
                  anallytics for your automation needs.  While other companies are intergrating multiple different solutions that introduces many fault points 
                  - work with 1 partner - get the highest ROI for our investment
                </FuturaParagraph>
              </Card>

              <Diagram
                containerCSS={{
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  flex: `1 1 100%`,
                  borderTop: `1px solid ${colors.ui.light}`,
                }}
              />

              <div css={{ flex: `1 1 100%` }}>
                <Container hasSideBar={false}>
                  <div
                    css={{
                      textAlign: `center`,
                      padding: `${rhythm(1)} 0 ${rhythm(2)}`,
                    }}
                  >
                    <h1 css={{ marginTop: 0 }}>Curious yet?</h1>
                    <FuturaParagraph>
                      It only takes a few minutes to schedule a free consultation 
                     </FuturaParagraph>
                     <FuturaParagraph>
                      Don't worry, our sales rep always bring a Robotics & Automation Engineer for every meeting
                     </FuturaParagraph>


                    <CtaButton to="/docs/" overrideCSS={{ marginTop: `1rem` }}>
                      Lets get Started
                    </CtaButton>
                  </div>
                </Container>
              </div>

              <div
                css={{
                  borderTop: `1px solid ${colors.ui.light}`,
                  flex: `1 1 100%`,
                  [presets.Tablet]: {
                    paddingTop: rhythm(1),
                  },
                }}
              >
                <Container
                  hasSideBar={false}
                  css={{ maxWidth: rhythm(30), paddingBottom: `0 !important` }}
                >
                  <h2
                    css={{
                      textAlign: `left`,
                      marginTop: 0,
                      color: colors.gatsby,
                      [presets.Tablet]: {
                        paddingBottom: rhythm(1),
                      },
                    }}
                  >
                  </h2>
                
 
                </Container>
              </div>
            </Cards>
          </div>
        </div>
      </div>
    )
  }
}

export default IndexRoute

export const pageQuery = graphql`
  query Index {
    site {
      siteMetadata {
        title
      }
    }
    file(relativePath: { eq: "gatsby-explanation.png" }) {
      childImageSharp {
        sizes(maxWidth: 870) {
          src
          srcSet
          sizes
        }
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 3
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/docs.blog/" }
      }
    ) {
      edges {
        node {
          ...BlogPostPreview_item
        }
      }
    }
  }
`
