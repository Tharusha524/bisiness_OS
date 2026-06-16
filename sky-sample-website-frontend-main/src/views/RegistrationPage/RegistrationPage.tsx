import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import leftLandingLeave from "../../assets/b_leaf_l.svg";
import rightLandingLeave from "../../assets/b_leaf_r.svg";
import ImageCarousel from "../../components/ImageCarousel";
import RegistrationForm from "./RegistrationForm";
import useCurrentUser from "../../hooks/useCurrentUser";
import PageLoader from "../../components/PageLoader";
import { useNavigate } from "react-router";
import index3 from "../../assets/new3.png";
import index4 from "../../assets/Untitled design (2).png";
import index5 from "../../assets/Untitled design (3).png";
import index6 from "../../assets/Untitled design (4).png";
import { useEffect } from "react";

function RegistrationPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const navigate = useNavigate();

  const { user, isFetching } = useCurrentUser();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  if (isFetching) {
    return <PageLoader />;
  }

  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflowY: "hidden ",
      }}
    >
      <Stack
        direction={isMdUp ? "row" : "column"}
        sx={{ width: "100%", overflowY: "auto" }}
      >
        <Stack
          sx={{
            flex: isMdUp ? 3 : 1,
            backgroundColor: theme.palette.background.default,
            height: isMdUp ? "100vh" : "auto",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ImageCarousel
            images={[
              { src: index3, alt: "Employee Engagement" },
              { src: index4, alt: "Welcome" },
              { src: index5, alt: "Health & Safety" },
              { src: index6, alt: "Business Insights" },
            ]}
          />
          <Typography
            variant={isMdUp ? "h2" : "h3"}
            sx={{
              fontWeight: "700",
              color: theme.palette.text.primary,
              marginTop: "1rem",
              marginLeft: "1rem",
              marginRight: "1rem",
              textAlign: "center",
            }}
          >
            DIO Solutions
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "600",
              color: theme.palette.text.secondary,
              margin: "1rem",
              textAlign: "center",
            }}
          >
            Copyright © 2026 DIO Solutions, All Rights Reserved
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "400",
              color: theme.palette.text.secondary,
              textAlign: "center",
              marginLeft: "3rem",
              marginRight: "3rem",
              marginBottom: "2rem",
            }}
          >
            Welcome to your smarter way of running a business. Our Business OS
            brings everything you need operations, teams, workflows, and
            insights into one seamless platform built to help your business
            grow.
          </Typography>
        </Stack>
        <Stack sx={{ flex: isMdUp ? 2 : 1, justifyContent: "center" }}>
          <RegistrationForm />
        </Stack>
      </Stack>
      <img
        src={leftLandingLeave}
        alt="Logo"
        width={150}
        height={150}
        style={{ position: "absolute", left: 0, bottom: -5, zIndex: 10 }}
      />
      <img
        src={rightLandingLeave}
        alt="Logo"
        width={150}
        height={150}
        style={{ position: "absolute", right: 0, bottom: -20, zIndex: 10 }}
      />
    </Stack>
  );
}

export default RegistrationPage;
