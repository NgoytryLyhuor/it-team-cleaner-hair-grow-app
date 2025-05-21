import { StyleSheet , View , ActivityIndicator} from 'react-native'

const Loading = () => {
    return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size={30} color="#000" />
        </View>
    )
}

export default Loading

const styles = StyleSheet.create({})