import React from "react";
import styles from "../styles/About.module.css";
import Header from "@/components/Header";

const AboutPage = () => {
  return (
    <>
      <Header />
      <div className={styles.aboutPage}>
        <section className={styles.hero}>
          <h1 className={styles.title}>About HillsGo</h1>
          <p className={styles.description} style={{ textAlign: "justify" }}>
            HillsGo Delivery is an innovative food and commodity delivery
            service based in Senapati, Manipur, designed to bring convenience
            and variety to the local community. HillsGo aims to offer a
            versatile solution for various delivery needs in the region&apos;s
            growing towns by leveraging technology, real-time tracking, and a
            customer-centric approach. What sets HillsGo apart is its deep
            commitment to the community. By providing a platform for local
            businesses to thrive and actively participating in community-driven
            events, HillsGo strives to be more than just a delivery service—it
            aims to be an essential part of Senapatis growth. With plans to
            expand to nearby towns, HillsGo Delivery is poised to bring
            convenience, flavor, and joy to the region. Coming soon...
          </p>
        </section>

        <section className={styles.team}>
          <h2 className={`${styles.teamTitle} subTitle`}>Meet the team</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.memberContainer}>
                <div className={styles.profileFrame}>
                  <img
                    src="./assets/images/Kalo.jpeg"
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
                  <p className={`${styles.memberName} subTitle3`}>Co Founder</p>
                  <p>
                    A Postgraduate from Tata Institute of Social Sciences with 7
                    years of experience in the development sector. Work
                    experience spans across notable organizations including
                    NRLM, Tata Trusts, SwitchON Foundation, Spectra Foundation,
                    and Realms of Nature-Based Actions. An enthusiastic
                    entrepreneur, passionate about contributing to societal
                    growth through innovative and sustainable solutions.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.teamMember}>
              <div className={styles.memberContainer}>
                <div className={styles.profileFrame}>
                  <img
                    src="./assets/images/ashuli.jpeg"
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
                    Co Founder || Digital Marketing Professional
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
                    FinerBlue as a freelancer. As a marketing professional, he
                    has been worked with some of the leading companies in the
                    industry, including Google, Meta, and Dentsu, since 2018.
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
                  <p className={`${styles.memberName} subTitle3`}>Co Founder</p>
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
                  <p>
                    One quotes that keeps him grounded: &quot;If I have seen
                    further, it is by standing on the shoulders of giants.&quot;
                  </p>
                  <p>A leader he greatly admires is Dr. APJ Abdul Kalam.</p>
                </div>
              </div>
            </div>

            <div className={styles.teamMember}>
              <div className={styles.memberContainer}>
                <div className={styles.profileFrame}>
                  <img
                    src="./assets/images/profile-image.png"
                    alt="Alexander"
                    className={styles.profileImage}
                  />
                </div>

                <div
                  className={styles.memberDetails}
                  style={{ textAlign: "justify" }}
                >
                  <h3 className={`${styles.memberName} subTitle2`}>
                    Alexander
                  </h3>
                  <p className={`${styles.memberName} subTitle3`}>Investor</p>
                  <p>Profile Details</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
