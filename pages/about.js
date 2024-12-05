import React from "react";
import styles from "../styles/About.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutPage = () => {
  return (
    <>
      <Header />
      <div className={styles.aboutPage}>
        <section className={styles.hero}>
          <h1 className={styles.title}>About HillsGO</h1>
          <p className={styles.description} style={{ textAlign: "justify" }}>
            HillsGO is a dynamic startup based in Senapati, Manipur, dedicated
            to revolutionizing the local economy through innovative technology.
            Our platform serves as a hub that connects skilled labor, local
            businesses, and consumers, offering services like job matching,
            e-commerce for local products, and reliable pick-and-drop services.
            With a focus on empowering the community, HillsGO aims to generate
            employment, support local entrepreneurs, and provide convenience to
            residents. We are committed to driving economic growth, fostering
            development, and building a sustainable ecosystem for the future of
            Senapati and beyond. Coming soon...
          </p>
        </section>

        <section className={styles.team}>
          <h2 className={`${styles.teamTitle} subTitle`}>Meet the team</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.memberContainer}>
                <div className={styles.profileFrame}>
                  <img
                    src="./assets/images/kalo.png"
                    alt="PH Ramaikalo"
                    className={styles.profileImage}
                  />
                </div>

                <div
                  className={styles.memberDetails}
                  style={{ textAlign: "justify" }}
                >
                  <h3 className={`${styles.memberName} subTitle2`}>
                    PH Ramaikalo
                  </h3>
                  <p className={`${styles.memberName} subTitle3`}>
                    Co-Founder | Operations Lead
                  </p>
                  <p>
                    A postgraduate from the Tata Institute of Social Sciences in
                    Rural Development & Governance, he has 7 years of experience
                    in the development sector, working with notable
                    organizations, namely NRLM, Tata Trusts, SwitchON
                    Foundation, Spectra Foundation, and Realms of Nature-Based
                    Actions. He has collaborated with government ministries such
                    as RD&PR, MoW&CD, and MoA&FW on policy development and
                    project implementation. Having worked across India in
                    Rajasthan, Delhi, Kolkata, Meghalaya, Nagaland, Manipur, and
                    Hyderabad, he has gained a deep understanding of the
                    country&apos;s diverse cultures. He is the creative designer
                    at FinerBlue. An enthusiastic entrepreneur, he is passionate
                    about contributing to societal growth through innovative and
                    sustainable solutions.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.teamMember}>
              <div className={styles.memberContainer}>
                <div className={styles.profileFrame}>
                  <img
                    src="./assets/images/ashuli.png"
                    alt="Ashuli Phimu"
                    className={styles.profileImage}
                  />
                </div>

                <div
                  className={styles.memberDetails}
                  style={{ textAlign: "justify" }}
                >
                  <h3 className={`${styles.memberName} subTitle2`}>
                    Ashuli Phimu
                  </h3>
                  <p className={`${styles.memberName} subTitle3`}>
                    Co-Founder | Marketing and Finance Lead
                  </p>
                  <p>
                    Known for his cheerful and friendly demeanor, he is adored
                    by his friends. Born into a humble yet loving and close-knit
                    family of six, which includes a brother, two sisters, and
                    caring parents, he has always been driven by a passion for
                    business and a deep desire to give back to the community
                    that shaped him.
                  </p>
                  <p>
                    He graduated with a Bachelor of Commerce degree from Gauhati
                    University. Following that, he worked as a contractor at
                    HPCL in Visakhapatnam for a year before co-founding
                    FinerBlue. Since 2018, he has worked as a marketing
                    professional with some of the world&apos;s leading
                    companies, including Google, Meta, and Dentsu.
                  </p>
                  <p>
                    Throughout his career, Ashuli has demonstrated a strong
                    business acumen and a commitment to helping others. His
                    journey from a modest upbringing to a successful
                    professional in the Marketing industry is a testament to his
                    resilience, dedication, and entrepreneurial spirit. He is
                    now focused on creating opportunities that not only benefit
                    his business but also uplift the society he hold dear. His
                    story is one of perseverance, faith, and an unwavering
                    commitment to turning dreams into reality, all while staying
                    true to the values instilled in him by his upbringing.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.teamMember}>
              <div className={styles.memberContainer}>
                <div className={styles.profileFrame}>
                  <img
                    src="./assets/images/khoshow.png"
                    alt="Khoshow"
                    className={styles.profileImage}
                  />
                </div>

                <div
                  className={styles.memberDetails}
                  style={{ textAlign: "justify" }}
                >
                  <h3 className={`${styles.memberName} subTitle2`}>Khoshow</h3>
                  <p className={`${styles.memberName} subTitle3`}>
                    Co-Founder | Tech Lead
                  </p>
                  <p>
                    Graduated in Software Engineering from Delhi College of
                    Engineering, he has been a wanderer ever since. He worked at
                    HPCL as a supplier in 2017-18 and later co-founded
                    FinerBlue, a software and marketing service provider focused
                    primarily on U.S. clients. He has developed various
                    solutions, ranging from websites to web applications and
                    inventory management systems, catering to both local and
                    international clients. He wrote a novel titled, &quot;In
                    search of a home.&quot; From a young age, he has been driven
                    by a desire to bring positive change to the region.
                  </p>

                  <p>A leader he greatly admires is Dr. APJ Abdul Kalam.</p>
                </div>
              </div>
            </div>

            <div className={styles.teamMember}>
              <div className={styles.memberContainer}>
                <div className={styles.profileFrame}>
                  <img
                    src="./assets/images/alexander.png"
                    alt="Alexander"
                    className={styles.profileImage}
                  />
                </div>

                <div
                  className={styles.memberDetails}
                  style={{ textAlign: "justify" }}
                >
                  <h3 className={`${styles.memberName} subTitle2`}>
                    Alexander Ngiimei
                  </h3>
                  <p className={`${styles.memberName} subTitle3`}>Investor</p>
                  <p>
                    Graduated from Rajagiri Business School with Marketing and
                    Finance. Since then, he has worked in the insurance
                    industry, spending 3.4 years at ICICI Prudential Life
                    Insurance before moving to Bharti AXA Life Insurance for
                    another 2 years.
                  </p>
                  <p>
                    He is currently working with Bajaj Allianz Life Insurance
                    Co. Ltd. as the Regional Manager, overseeing the Delhi NCR
                    region and heading corporate business related to Employee
                    Benefits Schemes in Uttarakhand.
                  </p>
                  <p>
                    Additionally, he is responsible for developing corporate
                    business in Nagaland for the time being through his current
                    organization. He has a strong mindset for building and
                    supporting small businesses and is an investor in Zewa
                    Studio, based in Delhi, which focuses on women&apos;s
                    clothing, accessories, and candles. He also possesses a
                    solid understanding of the stock markets.
                  </p>
                  <p>And also a fitness enthusiast since 2009. ;)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;
