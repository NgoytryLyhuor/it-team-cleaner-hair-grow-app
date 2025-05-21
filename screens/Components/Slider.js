import React from "react";
import { Dimensions, View, Image } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";

const data = [...new Array(6).keys()];
const { width } = Dimensions.get("window");

function Slider({ sliderData }) {
    
    const ref = React.useRef(null);
    const progress = useSharedValue(0);

    const onPressPagination = (index) => {
        ref.current?.scrollTo({
            count: index - progress.value,
            animated: true,
        });
    };

    return (
        <View>

            <View
                style={{
                    paddingHorizontal: 20,
                    marginTop: -20,
                    borderRadius: 10,
                    overflow: "hidden",
                    width: width,
                    position: 'relative'
                }}
            >

                <Carousel
                    autoPlay={true}
                    autoPlayInterval={2500}
                    loop
                    ref={ref}
                    width={width - 40} // Account for horizontal padding (20 left + 20 right)
                    height={200}
                    data={sliderData}
                    onProgressChange={progress}
                    renderItem={({ index }) => {
                        return (
                            <View style={{ flex: 1 }}>
                                <Image
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        resizeMode: "cover", // Use this instead of objectFit
                                        borderRadius: 10,
                                    }}
                                    source={{
                                        uri: sliderData[index].slider_image,
                                    }}
                                />
                            </View>
                        )
                    }}
                />
            </View>

            <View style={{ marginTop: -20 }}>
                <Pagination.Basic
                    progress={progress}
                    data={data}
                    dotStyle={{
                        backgroundColor: "rgba(0,0,0,0.4)",
                        borderRadius: 50,
                    }}
                    containerStyle={{
                        gap: 5,
                        marginTop: 0
                    }}

                    onPress={onPressPagination}
                />
            </View>

        </View>
    );
}

export default Slider;
