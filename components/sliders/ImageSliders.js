import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css"; // Import Swiper styles

const ImageSlider = ({ images }) => {
  return (
    <div style={styles.imagesContainer}>
      <Swiper
        spaceBetween={10} // Space between slides
        slidesPerView={1} // Number of slides to show at once
        pagination={{ clickable: true }} // Enable pagination
        navigation // Enable navigation buttons
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`Post Image ${index + 1}`}
              style={styles.image} // You can adjust your image styles here
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;

const styles = {
  imagesContainer: {
    width: "100%", // Full width
    height: "300px", // Set a height for the slider
    overflow: "hidden",
  },
  image: {
    width: "100%", // Ensure images take full width of the slide
    height: "auto", // Maintain aspect ratio
    objectFit: "cover", // Cover the entire space without distortion
  },
  // Other styles...
};
